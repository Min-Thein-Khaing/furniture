import { Redis } from "ioredis";
export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});


export const getOrSetCache = async(key:any , callback:any) => {
    try {
        const cacheData = await redis.get(key);
        if(cacheData){
            console.log("cache hit");
            return JSON.parse(cacheData);
        }
        console.log("cache miss")
        const data = await callback();
        // await redis.setex(key, 3600,JSON.stringify(data));
        await redis.set(key,JSON.stringify(data),"EX",3600);
        return data;
        
    } catch (error) {
        console.log("redis error : ", error);
        throw error;
    }
};
