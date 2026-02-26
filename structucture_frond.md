inventory-management-frontend/                 # 📂 Racine du projet frontend
│
├── public/                                    # 🌍 Fichiers statiques accessibles publiquement
│   ├── index.html                             # 🏠 Template HTML principal - React s'injecte dans <div id="root">
│   ├── manifest.json                          # 📱 Configuration PWA - permet d'installer l'app sur mobile
│   ├── robots.txt                             # 🤖 Instructions pour les moteurs de recherche (SEO)
│   ├── favicon.ico                             # 🔖 Icône de l'onglet du navigateur
│   └── logo192.png                             # 🖼️ Logo pour les appareils mobiles (PWA)
│
├── src/                                       # 📂 Code source principal de l'application
│   ├── assets/                                # 🎨 Ressources statiques
│   │   ├── images/                            # 🖼️ Images et icônes
│   │   │   ├── logo.png                        # 🏢 Logo principal de l'application
│   │   │   ├── default-avatar.png              # 👤 Avatar par défaut pour les utilisateurs
│   │   │   ├── no-image.png                     # 🚫 Image par défaut pour produits sans photo
│   │   │   └── icons/                          # 🎯 Icônes SVG pour la navigation
│   │   │       ├── dashboard.svg                # 📊 Icône du tableau de bord
│   │   │       ├── products.svg                 # 📦 Icône des produits
│   │   │       ├── invoices.svg                 # 🧾 Icône des factures
│   │   │       ├── customers.svg                # 👥 Icône des clients
│   │   │       └── reports.svg                   # 📈 Icône des rapports
│   │   ├── fonts/                              # 🔤 Polices personnalisées
│   │   │   └── (fichiers de polices .ttf .woff) # 📁 Dossier pour les polices téléchargées
│   │   └── styles/                             # 💅 Styles globaux
│   │       ├── _variables.scss                   # 🎯 Variables SCSS (couleurs, espacements, breakpoints)
│   │       ├── _mixins.scss                       # 🔧 Mixins réutilisables (responsive, flexbox)
│   │       ├── _animations.scss                   # ✨ Animations globales (fade, slide, spin)
│   │       └── global.scss                        # 🌍 Styles globaux (reset, typographie)
│   │
│   ├── components/                             # 🧩 Composants réutilisables
│   │   ├── common/                             # 🔧 Composants UI génériques (librairie interne)
│   │   │   ├── Button/                          # 🔘 Bouton personnalisable
│   │   │   │   ├── Button.jsx                    # ⚛️ Logique du bouton (variantes, onClick, disabled)
│   │   │   │   ├── Button.module.scss            # 💅 Styles CSS modules (isolés par composant)
│   │   │   │   └── index.js                      # 📦 Point d'export pour imports plus propres
│   │   │   ├── Input/                           # ⌨️ Champ de saisie avec validation
│   │   │   │   ├── Input.jsx                     # ⚛️ Logique de l'input (onChange, erreurs)
│   │   │   │   ├── Input.module.scss             # 💅 Styles du champ de saisie
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Modal/                           # 🪟 Fenêtre modale (popup)
│   │   │   │   ├── Modal.jsx                     # ⚛️ Logique d'ouverture/fermeture, backdrop
│   │   │   │   ├── Modal.module.scss             # 💅 Styles de la modale et overlay
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Card/                            # 🃏 Carte pour afficher des informations
│   │   │   │   ├── Card.jsx                      # ⚛️ Composant carte avec header, body, footer
│   │   │   │   ├── Card.module.scss              # 💅 Styles de la carte (ombre, bordures)
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Table/                           # 📊 Tableau avec fonctionnalités avancées
│   │   │   │   ├── Table.jsx                     # ⚛️ Tableau avec tri, sélection, pagination
│   │   │   │   ├── Table.module.scss             # 💅 Styles du tableau (lignes, en-têtes)
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Loader/                          # ⏳ Indicateur de chargement
│   │   │   │   ├── Loader.jsx                    # ⚛️ Spinner ou skeleton loader
│   │   │   │   ├── Loader.module.scss            # 💅 Animation de chargement
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Alert/                           # ⚠️ Notifications d'alerte
│   │   │   │   ├── Alert.jsx                     # ⚛️ Alertes succès, erreur, warning, info
│   │   │   │   ├── Alert.module.scss             # 💅 Styles par type d'alerte
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Pagination/                      # 📄 Navigation entre pages
│   │   │   │   ├── Pagination.jsx                # ⚛️ Contrôles de pagination (précédent/suivant)
│   │   │   │   ├── Pagination.module.scss        # 💅 Styles des boutons de pagination
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Select/                          # 📋 Liste déroulante
│   │   │   │   ├── Select.jsx                    # ⚛️ Menu déroulant avec options
│   │   │   │   ├── Select.module.scss            # 💅 Styles du select personnalisé
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── DatePicker/                      # 📅 Sélecteur de date
│   │   │   │   ├── DatePicker.jsx                # ⚛️ Calendrier pour choisir une date
│   │   │   │   ├── DatePicker.module.scss        # 💅 Styles du calendrier
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Badge/                           # 🏷️ Étiquette de statut
│   │   │   │   ├── Badge.jsx                     # ⚛️ Badge avec couleur (succès, danger, etc.)
│   │   │   │   ├── Badge.module.scss             # 💅 Styles par type de badge
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Tooltip/                         # 💬 Infobulle au survol
│   │   │   │   ├── Tooltip.jsx                   # ⚛️ Tooltip avec position personnalisable
│   │   │   │   ├── Tooltip.module.scss           # 💅 Styles de l'infobulle
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   └── Tabs/                            # 📑 Onglets de navigation
│   │   │       ├── Tabs.jsx                      # ⚛️ Navigation par onglets
│   │   │       ├── Tabs.module.scss              # 💅 Styles des onglets
│   │   │       └── index.js                      # 📦 Point d'export
│   │   │
│   │   ├── layout/                              # 🏗️ Composants de mise en page
│   │   │   ├── Sidebar/                         # 📌 Menu latéral
│   │   │   │   ├── Sidebar.jsx                   # ⚛️ Composant sidebar avec état ouvert/fermé
│   │   │   │   ├── Sidebar.module.scss           # 💅 Styles du sidebar
│   │   │   │   ├── SidebarData.js                # 📋 Configuration des menus (routes, icônes)
│   │   │   │   ├── SidebarItem.jsx               # ⚛️ Élément individuel du menu
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Navbar/                          # 🧭 Barre de navigation supérieure
│   │   │   │   ├── Navbar.jsx                    # ⚛️ Barre avec titre, recherche, profil
│   │   │   │   ├── Navbar.module.scss            # 💅 Styles de la navbar
│   │   │   │   ├── UserMenu.jsx                  # ⚛️ Menu déroulant utilisateur (profil, logout)
│   │   │   │   ├── NotificationBell.jsx          # 🔔 Icône de notifications avec badge
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   ├── Footer/                          # 🦶 Pied de page
│   │   │   │   ├── Footer.jsx                    # ⚛️ Pied de page avec copyright
│   │   │   │   ├── Footer.module.scss            # 💅 Styles du footer
│   │   │   │   └── index.js                      # 📦 Point d'export
│   │   │   └── MainLayout/                      # 📐 Layout principal
│   │   │       ├── MainLayout.jsx                # ⚛️ Layout qui enveloppe toutes les pages
│   │   │       ├── MainLayout.module.scss        # 💅 Styles du layout (grille)
│   │   │       └── index.js                      # 📦 Point d'export
│   │   │
│   │   └── features/                            # ✨ Composants métier spécifiques
│   │       ├── Auth/                             # 🔐 Authentification
│   │       │   ├── LoginForm/                    # 📝 Formulaire de connexion
│   │       │   │   ├── LoginForm.jsx              # ⚛️ Formulaire avec validation et soumission
│   │       │   │   ├── LoginForm.module.scss      # 💅 Styles spécifiques au login
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── RegisterForm/                 # 📝 Formulaire d'inscription
│   │       │   │   ├── RegisterForm.jsx           # ⚛️ Inscription avec validation des champs
│   │       │   │   ├── RegisterForm.module.scss   # 💅 Styles du formulaire d'inscription
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── ForgotPassword/               # 🔑 Mot de passe oublié
│   │       │   │   ├── ForgotPasswordForm.jsx     # ⚛️ Formulaire d'envoi d'email de reset
│   │       │   │   ├── ForgotPasswordForm.module.scss # 💅 Styles
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   └── ResetPassword/                # 🔐 Réinitialisation mot de passe
│   │       │       ├── ResetPasswordForm.jsx      # ⚛️ Formulaire de nouveau mot de passe
│   │       │       ├── ResetPasswordForm.module.scss # 💅 Styles
│   │       │       └── index.js                  # 📦 Point d'export
│   │       │
│   │       ├── Dashboard/                        # 📊 Tableau de bord
│   │       │   ├── StatsCards/                   # 📈 Cartes de statistiques
│   │       │   │   ├── StatsCards.jsx             # ⚛️ Cartes (ventes, produits, clients)
│   │       │   │   ├── StatsCards.module.scss     # 💅 Styles des cartes
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── RecentActivity/               # 🔄 Activités récentes
│   │       │   │   ├── RecentActivity.jsx         # ⚛️ Liste des dernières actions
│   │       │   │   ├── RecentActivity.module.scss # 💅 Styles
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── Charts/                       # 📉 Graphiques
│   │       │   │   ├── SalesChart.jsx             # ⚛️ Graphique des ventes (line chart)
│   │       │   │   ├── ProfitChart.jsx            # ⚛️ Graphique des profits (bar chart)
│   │       │   │   ├── TopProductsChart.jsx       # ⚛️ Top produits (pie chart)
│   │       │   │   ├── Charts.module.scss         # 💅 Styles communs
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   └── QuickActions/                 # ⚡ Actions rapides
│   │       │       ├── QuickActions.jsx           # ⚛️ Boutons d'actions (nouvelle vente, produit)
│   │       │       ├── QuickActions.module.scss   # 💅 Styles
│   │       │       └── index.js                  # 📦 Point d'export
│   │       │
│   │       ├── Products/                         # 📦 Gestion des produits
│   │       │   ├── ProductList/                   # 📋 Liste des produits
│   │       │   │   ├── ProductList.jsx            # ⚛️ Composant principal de liste
│   │       │   │   ├── ProductList.module.scss    # 💅 Styles
│   │       │   │   ├── ProductTable.jsx           # ⚛️ Tableau des produits
│   │       │   │   ├── ProductFilters.jsx         # ⚛️ Filtres (catégorie, prix, stock)
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── ProductForm/                   # 📝 Formulaire produit
│   │       │   │   ├── ProductForm.jsx            # ⚛️ Formulaire complet
│   │       │   │   ├── ProductForm.module.scss    # 💅 Styles
│   │       │   │   ├── BasicInfoTab.jsx           # ⚛️ Onglet infos de base (nom, prix)
│   │       │   │   ├── StockTab.jsx               # ⚛️ Onglet gestion de stock
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── ProductDetails/                # ℹ️ Détails produit
│   │       │   │   ├── ProductDetails.jsx         # ⚛️ Page détails
│   │       │   │   ├── ProductDetails.module.scss # 💅 Styles
│   │       │   │   ├── ProductInfo.jsx            # ⚛️ Informations produit
│   │       │   │   ├── StockHistory.jsx           # ⚛️ Historique des mouvements
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── BarcodeScanner/                # 📸 Scanner code-barres
│   │       │   │   ├── BarcodeScanner.jsx         # ⚛️ Scanner pour recherche rapide
│   │       │   │   ├── BarcodeScanner.module.scss # 💅 Styles
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   └── CategoryManager/               # 🏷️ Gestion des catégories
│   │       │       ├── CategoryManager.jsx        # ⚛️ Gestionnaire principal
│   │       │       ├── CategoryList.jsx           # ⚛️ Liste des catégories
│   │       │       ├── CategoryForm.jsx           # ⚛️ Formulaire catégorie
│   │       │       ├── CategoryManager.module.scss # 💅 Styles
│   │       │       └── index.js                  # 📦 Point d'export
│   │       │
│   │       ├── Invoices/                          # 🧾 Factures
│   │       │   ├── InvoiceList/                    # 📋 Liste des factures
│   │       │   │   ├── InvoiceList.jsx            # ⚛️ Liste avec filtres
│   │       │   │   ├── InvoiceList.module.scss    # 💅 Styles
│   │       │   │   ├── InvoiceTable.jsx           # ⚛️ Tableau des factures
│   │       │   │   ├── InvoiceFilters.jsx         # ⚛️ Filtres par date, client, statut
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── InvoiceForm/                    # 📝 Création facture
│   │       │   │   ├── InvoiceForm.jsx            # ⚛️ Formulaire principal
│   │       │   │   ├── InvoiceForm.module.scss    # 💅 Styles
│   │       │   │   ├── CustomerInfo.jsx           # ⚛️ Sélection client
│   │       │   │   ├── InvoiceItems.jsx           # ⚛️ Lignes de facture
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── InvoiceDetails/                 # ℹ️ Détails facture
│   │       │   │   ├── InvoiceDetails.jsx         # ⚛️ Page détails
│   │       │   │   ├── InvoiceDetails.module.scss # 💅 Styles
│   │       │   │   ├── InvoiceHeader.jsx          # ⚛️ En-tête (numéro, date)
│   │       │   │   ├── InvoiceItemsTable.jsx      # ⚛️ Tableau des articles
│   │       │   │   ├── InvoiceSummary.jsx         # ⚛️ Totaux et paiement
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   └── POS/                           # 🏪 Point de vente (caisse)
│   │       │       ├── POS.jsx                    # ⚛️ Interface de caisse principale
│   │       │       ├── POS.module.scss            # 💅 Styles POS
│   │       │       ├── Cart.jsx                   # 🛒 Panier d'achat
│   │       │       ├── CartItem.jsx               # 📦 Article dans le panier
│   │       │       ├── PaymentModal.jsx           # 💳 Modal de paiement
│   │       │       ├── ProductSearch.jsx          # 🔍 Recherche produits
│   │       │       └── index.js                  # 📦 Point d'export
│   │       │
│   │       ├── Customers/                         # 👥 Clients
│   │       │   ├── CustomerList/                   # 📋 Liste des clients
│   │       │   │   ├── CustomerList.jsx           # ⚛️ Liste avec filtres
│   │       │   │   ├── CustomerList.module.scss   # 💅 Styles
│   │       │   │   ├── CustomerTable.jsx          # ⚛️ Tableau clients
│   │       │   │   ├── CustomerFilters.jsx        # ⚛️ Filtres (VIP, ville)
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── CustomerForm/                   # 📝 Formulaire client
│   │       │   │   ├── CustomerForm.jsx           # ⚛️ Création/édition client
│   │       │   │   ├── CustomerForm.module.scss   # 💅 Styles
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   └── CustomerDetails/                # ℹ️ Détails client
│   │       │       ├── CustomerDetails.jsx        # ⚛️ Page détails
│   │       │       ├── CustomerDetails.module.scss # 💅 Styles
│   │       │       ├── CustomerInfo.jsx           # ⚛️ Infos client
│   │       │       ├── PurchaseHistory.jsx        # ⚛️ Historique achats
│   │       │       └── index.js                  # 📦 Point d'export
│   │       │
│   │       ├── Expenses/                          # 💰 Dépenses
│   │       │   ├── ExpenseList/                    # 📋 Liste des dépenses
│   │       │   │   ├── ExpenseList.jsx            # ⚛️ Liste avec filtres
│   │       │   │   ├── ExpenseList.module.scss    # 💅 Styles
│   │       │   │   ├── ExpenseTable.jsx           # ⚛️ Tableau dépenses
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── ExpenseForm/                    # 📝 Formulaire dépense
│   │       │   │   ├── ExpenseForm.jsx            # ⚛️ Ajout dépense
│   │       │   │   ├── ExpenseForm.module.scss    # 💅 Styles
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   └── ExpenseCategories/              # 🏷️ Catégories de dépenses
│   │       │       ├── ExpenseCategories.jsx      # ⚛️ Gestion catégories
│   │       │       ├── ExpenseCategories.module.scss # 💅 Styles
│   │       │       └── index.js                  # 📦 Point d'export
│   │       │
│   │       ├── Stock/                             # 📦 Gestion des stocks
│   │       │   ├── StockMovements/                 # 🔄 Mouvements de stock
│   │       │   │   ├── StockMovements.jsx         # ⚛️ Historique mouvements
│   │       │   │   ├── StockMovements.module.scss # 💅 Styles
│   │       │   │   ├── MovementsTable.jsx         # ⚛️ Tableau mouvements
│   │       │   │   ├── MovementsFilters.jsx       # ⚛️ Filtres par type
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── StockAdjustment/                # ⚖️ Ajustement stock
│   │       │   │   ├── StockAdjustment.jsx        # ⚛️ Ajustement manuel
│   │       │   │   ├── StockAdjustment.module.scss # 💅 Styles
│   │       │   │   ├── AdjustmentForm.jsx         # ⚛️ Formulaire d'ajustement
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   └── LowStockAlert/                  # ⚠️ Alertes stock faible
│   │       │       ├── LowStockAlert.jsx          # ⚛️ Liste produits à réapprovisionner
│   │       │       ├── LowStockAlert.module.scss  # 💅 Styles
│   │       │       ├── AlertCard.jsx              # ⚛️ Carte d'alerte individuelle
│   │       │       └── index.js                  # 📦 Point d'export
│   │       │
│   │       ├── Reports/                           # 📊 Rapports
│   │       │   ├── SalesReport/                    # 💰 Rapport ventes
│   │       │   │   ├── SalesReport.jsx            # ⚛️ Rapport principal
│   │       │   │   ├── SalesReport.module.scss    # 💅 Styles
│   │       │   │   ├── SalesChart.jsx             # ⚛️ Graphique ventes
│   │       │   │   ├── SalesSummary.jsx           # ⚛️ Résumé chiffres
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── ProfitLoss/                     # 📉 Profits/pertes
│   │       │   │   ├── ProfitLoss.jsx             # ⚛️ Rapport P&L
│   │       │   │   ├── ProfitLoss.module.scss     # 💅 Styles
│   │       │   │   ├── ProfitChart.jsx            # ⚛️ Graphique profits
│   │       │   │   ├── ExpensesBreakdown.jsx      # ⚛️ Détail dépenses
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   ├── InventoryReport/                # 📦 Rapport inventaire
│   │       │   │   ├── InventoryReport.jsx        # ⚛️ État des stocks
│   │       │   │   ├── InventoryReport.module.scss # 💅 Styles
│   │       │   │   ├── StockValue.jsx             # ⚛️ Valeur du stock
│   │       │   │   ├── CategoryBreakdown.jsx      # ⚛️ Répartition par catégorie
│   │       │   │   └── index.js                  # 📦 Point d'export
│   │       │   └── ReportFilters/                  # 🎛️ Filtres rapports
│   │       │       ├── ReportFilters.jsx          # ⚛️ Filtres (date, catégorie)
│   │       │       ├── ReportFilters.module.scss  # 💅 Styles
│   │       │       └── index.js                  # 📦 Point d'export
│   │       │
│   │       └── Settings/                          # ⚙️ Paramètres
│   │           ├── CompanySettings/                # 🏢 Paramètres entreprise
│   │           │   ├── CompanySettings.jsx        # ⚛️ Configuration société
│   │           │   ├── CompanySettings.module.scss # 💅 Styles
│   │           │   ├── CompanyInfoForm.jsx        # ⚛️ Formulaire infos société
│   │           │   ├── PreferencesForm.jsx        # ⚛️ Préférences (devise, date)
│   │           │   └── index.js                  # 📦 Point d'export
│   │           └── UserManagement/                 # 👥 Gestion utilisateurs
│   │               ├── UserManagement.jsx         # ⚛️ Gestionnaire principal
│   │               ├── UserManagement.module.scss # 💅 Styles
│   │               ├── UserList.jsx               # ⚛️ Liste utilisateurs
│   │               ├── UserForm.jsx               # ⚛️ Formulaire utilisateur
│   │               ├── PermissionsManager.jsx     # ⚛️ Gestion des rôles/droits
│   │               └── index.js                  # 📦 Point d'export
│   │
│   ├── pages/                                   # 📄 Pages complètes
│   │   ├── Auth/                                 # 🔐 Pages d'authentification
│   │   │   ├── LoginPage.jsx                     # 🔑 Page de connexion
│   │   │   ├── RegisterPage.jsx                  # 📝 Page d'inscription
│   │   │   ├── ForgotPasswordPage.jsx            # 🔐 Page mot de passe oublié
│   │   │   ├── ResetPasswordPage.jsx             # 🔐 Page réinitialisation
│   │   │   └── index.js                          # 📦 Export des pages auth
│   │   ├── Dashboard/                            # 📊 Tableau de bord
│   │   │   ├── DashboardPage.jsx                 # 🏠 Page d'accueil après connexion
│   │   │   └── index.js                          # 📦 Export
│   │   ├── Products/                             # 📦 Pages produits
│   │   │   ├── ProductsPage.jsx                  # 📋 Liste produits
│   │   │   ├── CreateProductPage.jsx             # ➕ Création produit
│   │   │   ├── EditProductPage.jsx               # ✏️ Modification produit
│   │   │   ├── ProductDetailsPage.jsx            # ℹ️ Détails produit
│   │   │   └── index.js                          # 📦 Export
│   │   ├── Categories/                           # 🏷️ Pages catégories
│   │   │   ├── CategoriesPage.jsx                # 📋 Gestion catégories
│   │   │   └── index.js                          # 📦 Export
│   │   ├── Invoices/                             # 🧾 Pages factures
│   │   │   ├── InvoicesPage.jsx                  # 📋 Liste factures
│   │   │   ├── CreateInvoicePage.jsx             # ➕ Création facture
│   │   │   ├── InvoiceDetailsPage.jsx            # ℹ️ Détails facture
│   │   │   ├── POSPage.jsx                       # 🏪 Interface de caisse
│   │   │   └── index.js                          # 📦 Export
│   │   ├── Customers/                            # 👥 Pages clients
│   │   │   ├── CustomersPage.jsx                 # 📋 Liste clients
│   │   │   ├── CustomerDetailsPage.jsx           # ℹ️ Détails client
│   │   │   └── index.js                          # 📦 Export
│   │   ├── Expenses/                             # 💰 Pages dépenses
│   │   │   ├── ExpensesPage.jsx                  # 📋 Liste dépenses
│   │   │   ├── CreateExpensePage.jsx             # ➕ Création dépense
│   │   │   └── index.js                          # 📦 Export
│   │   ├── Stock/                                # 📦 Pages stock
│   │   │   ├── StockMovementsPage.jsx            # 🔄 Mouvements stock
│   │   │   ├── StockAdjustmentPage.jsx           # ⚖️ Ajustement stock
│   │   │   └── index.js                          # 📦 Export
│   │   ├── Reports/                              # 📊 Pages rapports
│   │   │   ├── ReportsPage.jsx                   # 📋 Liste rapports
│   │   │   ├── ReportDetailsPage.jsx             # ℹ️ Détail rapport
│   │   │   └── index.js                          # 📦 Export
│   │   ├── Settings/                             # ⚙️ Pages paramètres
│   │   │   ├── SettingsPage.jsx                  # ⚙️ Paramètres entreprise
│   │   │   ├── UsersPage.jsx                     # 👥 Gestion utilisateurs
│   │   │   └── index.js                          # 📦 Export
│   │   └── NotFound/                             # 404
│   │       ├── NotFoundPage.jsx                  # 🚫 Page 404
│   │       └── index.js                          # 📦 Export
│   │
│   ├── services/                                # 🌐 Services et API
│   │   ├── api/                                  # 📡 Communication avec le backend
│   │   │   ├── axiosConfig.js                    # ⚙️ Configuration Axios (baseURL, intercepteurs)
│   │   │   ├── authService.js                    # 🔐 Appels API auth (login, register, logout)
│   │   │   ├── userService.js                    # 👥 Appels API utilisateurs
│   │   │   ├── productService.js                  # 📦 Appels API produits
│   │   │   ├── categoryService.js                 # 🏷️ Appels API catégories
│   │   │   ├── customerService.js                 # 👤 Appels API clients
│   │   │   ├── invoiceService.js                  # 🧾 Appels API factures
│   │   │   ├── expenseService.js                  # 💰 Appels API dépenses
│   │   │   ├── stockService.js                    # 📦 Appels API mouvements de stock
│   │   │   ├── reportService.js                   # 📊 Appels API rapports
│   │   │   ├── companyService.js                  # 🏢 Appels API entreprise
│   │   │   ├── subscriptionService.js             # 📋 Appels API abonnements
│   │   │   └── index.js                          # 📦 Point d'export centralisé
│   │   └── socket/                               # 🔌 Communication temps réel
│   │       └── socketService.js                   # ⚡ Configuration Socket.io (notifications)
│   │
│   ├── store/                                    # 🗃️ État global Redux
│   │   ├── slices/                               # 🍕 Tranches Redux
│   │   │   ├── authSlice.js                      # 🔐 État auth (user, token, loading)
│   │   │   ├── productSlice.js                   # 📦 État produits
│   │   │   ├── cartSlice.js                      # 🛒 État panier
│   │   │   ├── invoiceSlice.js                   # 🧾 État factures
│   │   │   ├── customerSlice.js                  # 👤 État clients
│   │   │   ├── uiSlice.js                        # 🎨 État UI (theme, sidebar, modals)
│   │   │   └── index.js                          # 📦 Export des slices
│   │   ├── store.js                              # 🏬 Configuration store Redux
│   │   └── hooks.js                              # 🪝 Hooks Redux personnalisés
│   │
│   ├── hooks/                                    # 🪝 Hooks personnalisés
│   │   ├── useAuth.js                            # 🔐 Hook auth (connexion, déconnexion)
│   │   ├── useProducts.js                        # 📦 Hook produits (CRUD simplifié)
│   │   ├── useDebounce.js                        # ⏱️ Hook debounce (recherche)
│   │   ├── useLocalStorage.js                     # 💾 Hook localStorage
│   │   ├── usePermissions.js                      # 🛡️ Hook permissions
│   │   ├── useClickOutside.js                     # 👆 Hook clic à l'extérieur
│   │   ├── useWindowSize.js                       # 📏 Hook taille fenêtre (responsive)
│   │   └── index.js                              # 📦 Export des hooks
│   │
│   ├── utils/                                    # 🛠️ Utilitaires
│   │   ├── constants.js                          # 📏 Constantes (rôles, statuts)
│   │   ├── formatters.js                         # 💱 Formateurs (prix, dates)
│   │   ├── validators.js                         # ✅ Validateurs (email, téléphone)
│   │   ├── permissions.js                        # 🔒 Configuration permissions
│   │   ├── helpers.js                            # 🔧 Fonctions d'aide diverses
│   │   └── index.js                              # 📦 Export des utilitaires
│   │
│   ├── contexts/                                 # 🌍 Contextes React
│   │   ├── AuthContext.jsx                       # 🔐 Contexte authentification
│   │   ├── ThemeContext.jsx                      # 🎨 Contexte thème (clair/sombre)
│   │   ├── SocketContext.jsx                     # 🔌 Contexte WebSocket
│   │   └── index.js                              # 📦 Export des contextes
│   │
│   ├── routes/                                   # 🛣️ Configuration des routes
│   │   ├── AppRoutes.jsx                         # 🗺️ Routes principales
│   │   ├── PrivateRoute.jsx                      # 🔒 Route protégée
│   │   ├── PublicRoute.jsx                       # 🌐 Route publique
│   │   └── index.js                              # 📦 Export
│   │
│   ├── App.jsx                                   # ⚛️ Composant racine
│   ├── App.test.js                               # 🧪 Tests App
│   ├── index.js                                  # 🚀 Point d'entrée React
│   ├── index.scss                                # 🎨 Import styles globaux
│   └── setupTests.js                             # ⚙️ Configuration tests
│
├── .env                                          # 🔐 Variables d'environnement (local)
├── .env.example                                  # 📋 Exemple de variables (à copier)
├── .gitignore                                    # 🙈 Fichiers ignorés par Git
├── .eslintrc.js                                  # 📏 Configuration ESLint
├── .prettierrc                                   # ✨ Configuration Prettier
├── package.json                                  # 📦 Dépendances et scripts
├── package-lock.json                             # 🔒 Verrouillage versions
├── README.md                                     # 📖 Documentation projet
├── jsconfig.json                                 # ⚙️ Configuration imports absolus
├── craco.config.js                               # ⚙️ Override CRA sans eject
└── .env.development                              # 🌍 Variables dev
    .env.production                                # 🏭 Variables production