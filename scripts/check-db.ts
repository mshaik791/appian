const { checkDbConnection } = require('../src/lib/db')

async function main() {
  console.log('🔍 Checking database connection...')
  
  const isConnected = await checkDbConnection()
  
  if (isConnected) {
    console.log('🎉 Database is ready!')
    process.exit(0)
  } else {
    console.log('💥 Database connection failed!')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Script failed:', error)
  process.exit(1)
})
