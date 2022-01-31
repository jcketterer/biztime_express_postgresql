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

    company.invoices = invoices.map((invoice) => invoice.id)

    return res.json({ company: company })
  } catch (err) {
    return next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body
    const results = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [code, name, description],
    )
    return res.status(201).json({ company: results.rows[0] })
  } catch (err) {
    return next(err)
  }
})

router.put('/:code', async (req, res, next) => {
  try {
    let { name, description } = req.body
    let code = req.params.code

    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
      [name, description, code],
    )

    if (results.rows.length === 0) {
      throw new ExpressError(`No company with code of: ${code}`, 404)
    } else {
      return res.json({ company: results.rows[0] })
    }
  } catch (err) {
    return next(err)
  }
})

router.delete('/:code', async (req, res, next) => {
  try {
    const code = req.params.code
    const results = await db.query('DELETE FROM companies WHERE code=$1', [code])
    return res.send({msg: 'Deleted!'})
  } catch (err) {
    return next(err)
  }
})

module.exports = router
