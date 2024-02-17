const yup = require('yup');
var express = require('express');
var router = express.Router();

const { default: mongoose } = require('mongoose');
const { Customer } = require('../models');
const ObjectId = require('mongodb').ObjectId;

// Methods: POST / PATCH / GET / DELETE / PUT
// Get all
router.get('/', async (req, res, next) => {
  try {
    let results = await Customer.find();
    res.json(results);
  } catch (error) {
    res.status(500).json({ ok: false, error });
  }
});
// Create new data
router.post('/', async function (req, res, next) {
  // Validate body from client gửi lên sever
  const validationSchema = yup.object({
    body: yup.object({
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      email: yup.string().email().required(),
      phoneNumber: yup.number().required(),
      address: yup.string().required(),
      birthday: yup.string().required(),
  
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const data = req.body;

        const newItem = new Customer(data);
        let result = await newItem.save();

        return res.status(201).json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    })
    .catch((err) => {
      return res.status(400).json({ type: err.name, errors: err.errors, provider: 'yup' });
    });
});
//xóa
router.delete('/:id', function (req, res, next) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
        return ObjectId.isValid(value);
      }),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      try {
        const id = req.params.id;

        let found = await Customer.findByIdAndDelete(id);

        if (found) {
          return res.json(found);
        }

        return res.sendStatus(410);
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res.status(400).json({ type: err.name, errors: err.errors, message: err.message, provider: 'yup' });
    });
});
// update
router.patch('/:id', async function (req, res, next) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup.string().test('Validate ObjectID', '${path} is not valid ObjectID', (value) => {
        return ObjectId.isValid(value);
      }),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      try {
        const id = req.params.id;
        const patchData = req.body;

        let found = await Customer.findByIdAndUpdate(id, patchData);

        if (found) {
          return res.sendStatus(200);
        }

        return res.sendStatus(410);
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res.status(400).json({ type: err.name, errors: err.errors, message: err.message, provider: 'yup' });
    });
});

// ------------------------------------------------------------------------------------------------
// QUESTIONS 4a
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/manual/reference/operator/query/
router.get('/questions/4a', function (req, res, next) {
  try {
    const text = 'Hải Châu';
    const query = { address: new RegExp(`${text}`) };
    // address có chứa từ Hải Châu

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// ------------------------------------------------------------------------------------------------
// QUESTIONS 4b
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/manual/reference/operator/query/
// http://localhost:3000/customers/questions/4b?address=hải châu
router.get('/questions/4b', function (req, res, next) {
  try {
    const text = req.query.address;
    const query = { address: new RegExp(`${text}`) };
    // address có chứa từ Hải Châu

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// ------------------------------------------------------------------------------------------------
// QUESTIONS 5a
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/year/
router.get('/questions/5a', function (req, res, next) {
  try {
    const query = {
      $expr: {
        $eq: [{ $year: '$birthday' }, 1990],
      },
    };

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// ------------------------------------------------------------------------------------------------
// QUESTIONS 5b
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/year/
// http://localhost:3000/customers/questions/5b?year=1990
router.get('/questions/5b', function (req, res, next) {
  try {
    const year = req.query.year;

    const query = {
      $expr: {
        $eq: [{ $year: '$birthday' }, parseInt(year)],
      },
    };

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// ------------------------------------------------------------------------------------------------
// QUESTIONS 6a
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/month/
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/dayOfMonth/
// https://www.mongodb.com/docs/manual/reference/operator/query/
router.get('/questions/6a', function (req, res, next) {
  try {
    const today = new Date();
    const eqDay = { $eq: [{ $dayOfMonth: '$birthday' }, { $dayOfMonth: today }] };
    const eqMonth = { $eq: [{ $month: '$birthday' }, { $month: today }] };

    const query = {
      $expr: {
        $and: [eqDay, eqMonth],
      },
    };

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// ------------------------------------------------------------------------------------------------
// QUESTIONS 6a
// ------------------------------------------------------------------------------------------------
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/month/
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/dayOfMonth/
// https://www.mongodb.com/docs/manual/reference/operator/query/
// http://localhost:9000/customers/questions/6b?birthdayMonth=01&birthdayDay=22
router.get('/questions/6b', function (req, res, next) {
  try {
    const birthday = new Date(1990, parseInt(req.query.birthdayMonth) - 1, parseInt(req.query.birthdayDay) + 1);
    const eqDay = { $eq: [{ $dayOfMonth: '$birthday' }, { $dayOfMonth: birthday }] };
    const eqMonth = { $eq: [{ $month: '$birthday' }, { $month: birthday }] };

    const query = {
      $expr: {
        $and: [eqDay, eqMonth],
      },
    };

    Customer.find(query)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
