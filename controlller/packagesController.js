const packageSchema = require('../models/packages')

const addPackage = async (req, res) => {
    const {packageName, pricing} = req.body
    const resumePackage = new packageSchema({
        packageName: packageName,
        pricing: pricing
    })
    try {
        const result = await resumePackage.save()
        if (result) {
            return res.status(200).json({ msg: "package added succesfully" })
        } else {
            throw new Error("something went wrong with save")
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const fetchPackagePrice = async (req, res) => {
    const {yearsOfExperience, packageName} = req.body
    try {
        const package = await packageSchema.findOne({ packageName: { $regex: packageName, $options: 'i' } });
        if (package) {
            let price
            const pricing = package.pricing;
            for (const range in pricing) {
                const [min, max] = range.split('-').map(Number);

                if (yearsOfExperience >= min && (yearsOfExperience <= max || range === '20+')) {
                    price = pricing[range];
                    break;
                }
            }
            return res.status(200).json(price)

        } else {
            throw new Error("package not found")
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

module.exports = { addPackage, fetchPackagePrice }