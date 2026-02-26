// fix-user-company.js
import { sequelize, User, Company } from './src/models/index.js';
import { v4 as uuidv4 } from 'uuid';

async function fixUserCompany() {
  try {
    const userEmail = 'sitedelsage@gmail.com';
    const companyName = 'Planetech'; // Nom de l'entreprise à créer

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email: userEmail } });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('👤 Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      company_id: user.company_id
    });

    // Si l'utilisateur a déjà un company_id, vérifier qu'il existe
    if (user.company_id) {
      const company = await Company.findByPk(user.company_id);
      if (company) {
        console.log('✅ Entreprise existante:', company.id, company.name);
        return;
      }
    }

    // Créer une nouvelle entreprise
    const companyId = uuidv4();
    const company = await Company.create({
      id: companyId,
      name: companyName,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      _export_date: new Date()
    });

    console.log('🏢 Nouvelle entreprise créée:', company.id);

    // Mettre à jour l'utilisateur
    await user.update({ company_id: company.id });

    console.log('✅ Utilisateur mis à jour avec company_id:', company.id);

    // Vérification finale
    const updatedUser = await User.findByPk(user.id);
    console.log('✅ Vérification finale:', {
      id: updatedUser.id,
      email: updatedUser.email,
      company_id: updatedUser.company_id
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

fixUserCompany();