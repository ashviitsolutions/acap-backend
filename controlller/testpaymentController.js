const paymentSchema = require('../models/payment')
const crypto = require('crypto')
const querystring = require('querystring')
const cheerio = require('cheerio');
const axios = require('axios')

const payu_payment = async (req, res) => {
  const { amount, productinfo, firstname, email, phone } = req.body
  // const PAYU_BASE_URL = 'https://sandboxsecure.payu.in/_payment'
  const PAYU_BASE_URL = "https://secure.payu.in/_payment"
  const transaction = {
    key: 'JPM7Fg',
    salt: process.env.MERCHANT_SALT_V1,
    txnid: "34245346536721",
    amount: amount,
    productinfo: productinfo,
    firstname: firstname,
    email: email,
    phone: phone,
    surl: 'https://apiplayground-response.herokuapp.com/',
    furl: 'https://apiplayground-response.herokuapp.com/',
  }

  try {
    const hashString = `${transaction.key}|${transaction.txnid}|${transaction.amount}|${transaction.productinfo}|${transaction.firstname}|${transaction.email}|||||||||||TuxqAugd`;
    const secureHash = crypto.createHash('sha512').update(hashString).digest('hex');
    // console.log(secureHash)
    const payload = {
      key: transaction.key,
      txnid: transaction.txnid,
      amount: transaction.amount,
      productinfo: transaction.productinfo,
      firstname: transaction.firstname,
      email: transaction.email,
      phone: transaction.phone,
      surl: transaction.surl,
      furl: transaction.furl,
      hash: secureHash
    };

    axios.post(PAYU_BASE_URL, querystring.stringify(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then((response) => {
        // console.log('Payment request successful');
        console.log(response.data)
        // return res.status(200).json(response.data)
        const html = response.data;
        const $ = cheerio.load(html);
        const redirectUrl = $('base').attr('href');
        if (redirectUrl) {
          return res.redirect(redirectUrl);
        } else {
          return res.status(400).json('Redirect URL not found');
        }

      })
      .catch((error) => {
        console.error('Payment request failed');
        return res.status(400).json(error.message);
      });
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

module.exports = { payu_payment }