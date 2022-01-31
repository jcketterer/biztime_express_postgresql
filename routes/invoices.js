const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');
const app = require('../app');

let router = new express.Router();

router.get('/', async function(req, res, next) {
	try {
		const result = await db.query(
			`SELECT id, comp_code 
           FROM invoices 
           ORDER BY id`
		);

		return res.json({ invoices: result.rows });
	} catch (err) {
		return next(err);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		let id = req.params.id;

		const results = await db.query(
			`SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description FROM invoices AS i INNER JOIN companies AS c ON (c.code = i.comp_code) WHERE id=$1`,
			[ id ]
		);

		if (results.rows.length === 0) {
			throw new ExpressError(`No invoice for ID: ${id}`, 404);
		}

		const data = results.rows[0];
		const invoice = {
			id: data.id,
			company: {
				code: data.comp_code,
				name: data.name,
				description: data.description
			},
			amt: data.amt,
			paid: data.paid,
			add_date: data.add_date,
			paid_date: data.paid_date
		};

		return res.json({ invoice: invoice });
	} catch (err) {
		return next(err);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING *`, [
			comp_code,
			amt
		]);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (err) {
		return next(err);
	}
});

router.put('/:id', async (req, res, next) => {
	try {
		
		let {amt,paid} = req.body;
    let id = req.params.id;

		// let paidDate = null;

		// const currResults = await db.query(`SELECT paid FROM invoices WHERE id=$1`, [ id ]);

		// const currPaidDate = currResults.rows[0].paid_date;

		// if (!currPaidDate && paid) {
		// 	paidDate = new Date();
		// } else if (!paid) {
		// 	paidDate = null;
		// } else {
		// 	paidDate = currPaidDate;
		// }

		const results = await db.query(
			`UPDATE invoices SET amt=$1, paid=$2, paid_date=${paid ? 'CURRENT_TIMESTAMP' : null} WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, id]);

    if (results.rows.length === 0) {
			throw new ExpressError(`No such invoice for id: ${id}`, 404);
		} else {
      return res.send({invoice: results.rows[0]});
    }

	} catch (err) {
		return next(err);
	}
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const results = await db.query('DELETE FROM invoices WHERE id=$1', [id])
    return res.send({msg: 'Deleted!'})
  } catch (err) {
    return next(err)
  }
})

module.exports = router;
