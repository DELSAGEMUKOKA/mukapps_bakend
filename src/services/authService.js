// src/services/authService.js
import { v4 as uuidv4 } from 'uuid'; // ← Ajoutez cette ligne en haut
import User from '../models/User.js';
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  async register(userData) {
    const { email, password, name, companyName } = userData;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CRÉER L'ENTREPRISE AVEC UN ID GÉNÉRÉ
    const companyId = uuidv4(); // Génère un ID unique
    
    const company = await Company.create({
      id: companyId,  // ← IMPORTANT: Fournir l'ID
      name: companyName,
      ownerId: null,  // Sera mis à jour après création de l'utilisateur
      createdAt: new Date().toISOString(),
      _export_date: new Date()
    });

    // ✅ CRÉER L'UTILISATEUR AVEC company_id
    const userId = uuidv4();
    
    const user = await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'admin', // Le premier utilisateur est admin
      company_id: company.id,
      is_active: true,
      email_verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _export_date: new Date()
    });

    // Mettre à jour l'ownerId de la company
    await company.update({ ownerId: user.id });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, companyId: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      },
      company: {
        id: company.id,
        name: company.name
      },
      token
    };
  }

  async login(email, password) {
    // Trouver l'utilisateur
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Company, as: 'company' }]
    });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Générer le token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, companyId: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      },
      company: user.company,
      token
    };
  }
}

export default new AuthService();