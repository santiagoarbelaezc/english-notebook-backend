// test-connection.js
require('dotenv').config();

console.log('='.repeat(60));
console.log('🔍 PRUEBA DE CONEXIÓN A MONGODB ATLAS');
console.log('='.repeat(60));

console.log('\n📋 VARIABLES DE ENTORNO:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Verificar URI
if (!process.env.MONGODB_URI) {
  console.log('❌ ERROR: MONGODB_URI no está definida en .env');
  console.log('💡 Asegúrate de que tu archivo .env tenga:');
  console.log('   MONGODB_URI=mongodb+srv://arbelaezzc11_db_user:tmtGzQPlAWdXThIo@cluster0.mongodb.net/english_notebook?...');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
console.log('MONGODB_URI longitud:', uri.length, 'caracteres');

// Extraer info (segura)
try {
  const userMatch = uri.match(/\/\/([^:]+):/);
  const hostMatch = uri.match(/@([^/]+)/);
  const dbMatch = uri.match(/\/([^?]+)\?/);
  
  if (userMatch) console.log('Usuario:', userMatch[1]);
  if (hostMatch) console.log('Host:', hostMatch[1]);
  if (dbMatch) console.log('Base de datos:', dbMatch[1]);
} catch (e) {
  console.log('Error analizando URI:', e.message);
}

console.log('\n' + '='.repeat(60));
console.log('🔗 PROBANDO CONEXIÓN...');

const mongoose = require('mongoose');

async function test() {
  try {
    const start = Date.now();
    
    // Configurar timeout corto para prueba
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    };
    
    console.log('Conectando... (timeout: 5 segundos)');
    
    await mongoose.connect(uri, options);
    
    const time = Date.now() - start;
    console.log(`\n✅ CONEXIÓN EXITOSA en ${time}ms!`);
    console.log('Host:', mongoose.connection.host);
    console.log('Base de datos:', mongoose.connection.name);
    
    // Listar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📚 Colecciones (${collections.length}):`);
    collections.forEach((col, i) => {
      console.log(`   ${i + 1}. ${col.name}`);
    });
    
    await mongoose.disconnect();
    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.log('\n❌ ERROR DE CONEXIÓN:');
    console.log('Nombre:', error.name);
    console.log('Mensaje:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.log('Código:', error.code);
      console.log('Código de error:', error.errorLabels);
    }
    
    if (error.message.includes('bad auth')) {
      console.log('\n🔐 PROBLEMA DE AUTENTICACIÓN');
      console.log('Verifica:');
      console.log('1. Usuario/contraseña correctos');
      console.log('2. El usuario tiene permisos en MongoDB Atlas');
      console.log('3. IP está en la whitelist (201.185.228.110)');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🌐 ERROR DE DNS/RED');
      console.log('No se puede encontrar el host de MongoDB Atlas');
    }
    
    if (error.message.includes('timed out')) {
      console.log('\n⏱️  TIMEOUT');
      console.log('La conexión está siendo bloqueada o hay problemas de red');
    }
  }
}

test();