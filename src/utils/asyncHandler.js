const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.then(
            requestHandler(req, res, next)
        ).catch((err) => next(err))
    }
}

export default asyncHandler;
// //higher order function
// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next)
//     }
//     catch (e) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }


