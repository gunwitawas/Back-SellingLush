export const mongoConfig = {
    hostUrl : "ds042459.mlab.com:42459",
    userName : "admin",
    password : "admin123",
    database : "myactivity",
    collectionUserProfile : "user_profile"
};

export const mongoUrl = "mongodb://"+mongoConfig.userName+":"+mongoConfig.password+"@"+mongoConfig.hostUrl+"/"+mongoConfig.database;

export const parser =  {useNewUrlParser: true};