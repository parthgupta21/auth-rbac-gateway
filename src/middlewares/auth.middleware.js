const { verifyAccessToken } = require("../utils/jwt");

module.exports = async(ctx, next) => {
    const authHeader = ctx.headers["authorization"];
    if(!authHeader){
        ctx.throw(401, "authentication required");
    }

    const parts = authHeader.split(" ");

    if(parts.length !== 2 || parts[0] !== "Bearer"){
        ctx.throw(401, "Invalid Authorization")
    }

    const token = parts[1];
    
    try {
        const payload = verifyAccessToken(token);
        ctx.state.user = {
            id: payload.userId
        }

        await next();
    } catch (error) {
        console.error("eeeeeeeee", error);
        ctx.throw(401, "Invalid or expired token");
    }
}