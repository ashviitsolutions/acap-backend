const crypto = require('crypto')
const paymentSchema = require('../models/payment');
const { User } = require('../models/userandFormDetails');
const orderSchema = require('../models/orders');
const {sendMail} = require('../utils/sendMail')

const createPaymenrequest = async (req, res) => {

  const { amount, productInfo, firstName, email, phone, packageName } = req.body;

  // Generate unique transaction ID
  const transactionId = Math.random().toString(36).substr(2, 9);

  // Generate hash
  const key = process.env.MERCHANT_KEY;
  const salt = process.env.MERCHANT_SALT_V1;
  const hashString =
    key +
    '|' +
    transactionId +
    '|' +
    amount +
    '|' +
    productInfo +
    '|' +
    firstName +
    '|' +
    email +
    '|||||||||||' +
    salt;

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');


  // Construct the response
  const response = {
    key: key,
    txnid: transactionId,
    amount: amount,
    productinfo: productInfo,
    firstname: firstName,
    email: email,
    phone: phone,
    surl: 'https://api.acapconsultants.com/api/payment/response/', // URL for successful payment callback
    furl: 'https://api.acapconsultants.com/api/payment/response/', // URL for failed payment callback
    hash: hash
  }

  res.json(response);
}

const payU_callback = async (req, res) => {

  const { key, txnid, amount, productinfo, firstname, email, status,phone, hash } = req.body;

  try {
    const expectedHashString = process.env.MERCHANT_KEY + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email +'||||||||||';
    const keyArray = expectedHashString.split('|');
    const reverseKeyArray = keyArray.reverse(); 
    const reverseKeyString = process.env.MERCHANT_SALT_V1 + '|' + status + '|' + reverseKeyArray.join('|');
    const expectedHash = crypto.createHash('sha512').update(reverseKeyString).digest('hex');

    console.log('expectedHash', expectedHash)
    console.log('hash', hash)
    if ( expectedHash === hash) {
      // Payment hash is valid

      if (status === 'success') {
        // Payment is successful
        const paymentDetails = new paymentSchema({
          transaction_id: txnid,
          amount: amount,
          paid_by: firstname,
          email: email,
          productInfo: productinfo,
          status: status
        })

        paymentDetails.save().then((result) => {
          const user = new User({
            'personalDetails.email': email,
            'personalDetails.name': firstname,
            'personalDetails.phone': phone
          })

          user.save().then((resp) => {
            const order = new orderSchema({
              paymentInfo: result._id,
              userInfo: resp._id,
              status: 0

            })
            order.save().then((data) => {
              const emailData = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Payment Acknowledgement',
                text: `Hello ${firstname}, 
                          You're recieving this mail because you've made payment against our service.Your
                          order id is ${data._id}. You can track your order using this order Id.`
              }

              sendMail(emailData).then((result) => {
                if (result) {
                  return res.redirect(`http://45.132.241.17:443/payment/success`)
                } else {
                  console.log('Failed to send email.');
                }
              }).catch(error => {
                console.error('Error sending email:', error.message);
              });
            }).catch((err) => {
              return res.status(400).json(err.message)
            })

          }).catch((err) => {
            return res.status(400).json(err.message)
          })
        }).catch((err) => {
          return res.status(400).json(err.message)
        })
        // Perform necessary actions, such as updating the order status or sending a confirmation email
      } else {
        // Payment failed
        const paymentDetails = new paymentSchema({
          transaction_id: txnid,
          amount: amount,
          paid_by: firstname,
          email: email,
          productInfo: productinfo,
          status: status
        })

        paymentDetails.save((error, result) => {
          if (error) return res.status(200).json(error.message)

          return res.status(200).json({ msg: 'OOPS! Payment Failed', data: req.body });

        })
      }
    } else {
      // Invalid payment hash
      // Perform necessary actions, such as logging the error or notifying the user
      return res.status(200).json({ msg: 'Something went wrong', computedHash: expectedHash, recievedHash: hash });

    }
  } catch (error) {
    return res.status(400).json(error.message)
  }
}



const fetchPaymentDetails = async (req, res) => {
  const transaction_id = req.params.id

  try {
    const details = await paymentSchema.findOne({ transaction_id: transaction_id })

    if (details) {
      const result = await orderSchema.findOne({paymentInfo:details._id}).populate('paymentInfo', 'transaction_id amount status email productInfo')
      return res.status(200).json(result)
    } else {
      return res.status(400).json({ msg: 'Detials can\'t be fetched' })
    }
  } catch (error) {
    return res.status(200).json(error.message)
  }
}
module.exports = { createPaymenrequest, payU_callback, fetchPaymentDetails }
