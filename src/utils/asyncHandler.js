const asyncHandler = (requestHandler) =>{
    (req,res,next) => {
        Promise.resolve(requestHandler(re,res,next)).catch((err)=> next(err ))
    }
}

export {asyncHandler}



// const asyncHandler = (fn)=> async ()=>{
//     try {
//       await fn(req,res,next)  
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success : false,
//             message : err.message
//         })
//     }
// }
