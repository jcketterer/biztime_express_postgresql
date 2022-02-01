const express = require('express')
const ExpressError = require('../expressError')
const db = require('../db')
const slugify = require('slugify')

let router = new express.Router()

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM industries`)
    return res.json({ industries: results.rows })
  } catch (err) {
    return next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { code, industry } = req.body
    const newCode = slugify(code, { lower: true })

    const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`, [
      newCode,
      industry
    ])
    return res.status(201).json({ industry: results.rows[0] })
  } catch (err) {
    return next(err)
  }
})

router.post('/:comp_code', async (req, res, next) => {
  try {
    const { industry_code } = req.body
    const { comp_code } = req.params

    const results = await db.query(
      `INSERT INTO companies_industries (comp_code, industry_code) VALUES ($1, $2) RETURNING *`,
      [comp_code, industry_code]
    )
    return res.status(201).json({ 'companies industries': results.rows[0] })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
