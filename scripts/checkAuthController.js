// scripts/checkAuthController.js
import * as authController from '../src/controllers/authController.js';

console.log('🔍 VÉRIFICATION DU AUTH CONTROLLER\n');

const functions = [
  'register', 'login', 'refreshToken', 'forgotPassword', 
  'resetPassword', 'verifyEmail', 'resendVerification', 
  'me', 'updateProfile', 'changePassword', 'logout', 'verifyResetToken'
];

let allGood = true;

functions.forEach(fn => {
  if (typeof authController[fn] === 'function') {
    console.log(`✅ ${fn} existe`);
  } else {
    console.log(`❌ ${fn} n'existe PAS`);
    allGood = false;
  }
});

if (!allGood) {
  console.log('\n⚠️  Des fonctions manquent dans authController.js');
}