import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'

export type CredentialsExportInput = {
  name: string
  email: string
  password: string
}

export async function buildCredentialsXlsx({ name, email, password }: CredentialsExportInput): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Credentials')

  sheet.columns = [
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Email', key: 'email', width: 32 },
    { header: 'Password', key: 'password', width: 20 },
  ]
  sheet.getRow(1).font = { bold: true }
  sheet.addRow({ name, email, password })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function buildCredentialsPdf({ name, email, password }: CredentialsExportInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  const chunks: Buffer[] = []
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  doc.fontSize(18).text('Login Credentials', { align: 'left' })
  doc.moveDown()

  doc.fontSize(12).text(`Name: ${name}`)
  doc.moveDown(0.5)
  doc.text(`Email: ${email}`)
  doc.moveDown(0.5)
  doc.text(`Password: ${password}`)
  doc.moveDown(1.5)

  doc.fontSize(10).fillColor('gray').text('Keep this document secure. Do not share these credentials over unsecured channels.')

  doc.end()

  return finished
}
