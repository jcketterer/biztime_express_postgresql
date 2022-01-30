const express = require('express')
const ExpressError = require('../expressError')
const db = require('../db')

let router = new express.Router()

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`)

    return res.json({ companies: results.rows })
  } catch (err) {
    return next(err)
  }
})

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params

    const companyResult = await db.query(
      `SELECT * FROM companies WHERE code=$1`,
      [code],
    )

    const invoiceResult = await db.query(
      `SELECT id FROM invoices WHERE comp_code=$1`,
      [code],
    )

    if (companyResult.rows.length === 0) {
      throw new ExpressError(`No company for code: ${code}`, 404)
    }

    const company = companyResult.rows[0]
    const invoices = invoiceResult.rows

    console.log(company)
    console.log(invoices)

    company.invoices = invoices.map((invoice) => invoice.id)

    console.log(company.invoices)

    return res.json({ company: company })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
