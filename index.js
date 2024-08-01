const express=require('express');
const mongoose=require('mongoose');
const app=express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
app.listen(3000,()=>{
    console.log("Server running successfully");
})
let b=mongoose.connect('mongodb://127.0.0.1:27017/facultyfeedback');
b.then((info)=>{
    console.log("Connection success");
})
b.catch((info)=>{
    console.log("Connection failed");
})
//html page to mongodb
let cseschema=new mongoose.Schema({
    ydp:Number,
    vvp:Number,
    pns:Number,
    gsn:Number,
    rk:Number
});
let csemodel =new mongoose.model('csedata',cseschema,'faculty');

//mongodb to html p
let loginschema=new mongoose.Schema({
    name:String,
    password:String
});
let loginmodel=new mongoose.model('csedata1',loginschema,'logindata');
//html page to mongodb
app.get('/home',(req,res)=>{
    res.sendFile(__dirname+'/public/home.html');
})
app.post('/postdata',async(req,res)=>{
    let data={
         ydp:req.body.ydp,
         vvp:req.body.vvp,
         pns:req.body.pns,
         gsn:req.body.gsn,
         rk:req.body.rk
    }
    const m=new csemodel(data);
    await m.save().then((info)=>{
        // res.json("Your response have been saved");
        console.log("Data inserted");
        const alertScript = `
        <script>
            alert("Your response has been saved");
            window.location.href = "/home.html";
        </script>
    `;
    return res.send(alertScript);
       // res.sendFile(__dirname+'/public/home.html');
      // res.redirect('/public/home.html');
    }).catch((err)=>{
        res.send(err.message);
    })
})

app.get('/login',(req,res)=>{
    res.sendFile(__dirname+'/public/login.html');
})
percentage=[];
app.post('/check',async(req,res)=>{
    let user=await loginmodel.findOne({name:req.body.name1});
     if(user){
        let password=req.body.password1===user.password;
        if(password){
            let ydp='ydp';
            let vvp='vvp';
            let pns='pns';
            let gsn='gsn';
            let rk='rk';
            
            let yper = await csemodel.find({}, {[ydp]: 1}).exec();
            let vper = await csemodel.find({}, {[vvp]: 1}).exec();
            let pper = await csemodel.find({}, {[pns]: 1}).exec();
            let gper = await csemodel.find({}, {[gsn]: 1}).exec();
            let bper = await csemodel.find({}, {[rk]: 1}).exec();

            function average(arr){
                if (arr.length === 0) {
                    return 0; 
                }
                const sum = arr.reduce((acc, val) => acc + val, 0);
                const average = Math.round(sum / arr.length,2);
                return average;
            }

            let value1 = average(yper.map(doc => doc[ydp]));
            let value2 = average(vper.map(doc => doc[vvp]));
            let value3 = average(pper.map(doc => doc[pns]));
            let value4 = average(gper.map(doc => doc[gsn]));
            let value5 = average(bper.map(doc => doc[rk]));

            percentage=[{
                name:"Y DURGA PRASAD",
                per:value1
            },
            {
                name:"V VEERA PRASAD",
                per:value2
            },
            {
                name:"PNS LAKSHMI",
                per:value3
            },
            {
                name:"GSN MURTHY",
                per:value4
            },
            {
                name:"RAMAKRISHNA",
                per:value5
            }]

            res.render('sample1.pug',{"p":percentage});
            //res.sendFile(__dirname+'/public/view.html');
               
        } 
        else{
            const alertScript = `
        <script>
            alert("Enter correct password");
            window.location.href = "/login.html";
        </script>
    `;
    return res.send(alertScript);
        }
     }
     else{
        const alertScript = `
        <script>
            alert("No user found");
            window.location.href = "/login.html";
        </script>
    `;
    return res.send(alertScript);
     }
})
app.post('/display',(req,res)=>{
    percentage.sort((a, b) => b.per - a.per);
    res.render('sample2.pug',{"p":percentage});
}) 


// app.post('/view',(req,res)=>{
//     let faculty=req.body.faculty;
//     console.log(faculty);
//     let a=csemodel.find({},{[faculty]:1});
//     res.send(a);
// })


app.post('/view', async (req, res) => {
        let faculty = req.body.faculty;
        console.log(faculty);
        
        // Execute the Mongoose query to retrieve documents
        let documents = await csemodel.find({}, {[faculty]: 1}).exec();

        // Extract values of the specified key from the retrieved documents
        let values = documents.map(doc => doc[faculty]);

        // Send the retrieved values as the response
        //res.send(values);
        let s=0;
        for(let i in values){
           s=s+values[i];
        }
        let avg=s/values.length;
        console.log(avg);
        let selectedLabel;
    switch (faculty) {
      case "ydp":
        selectedLabel = "Y DURGA PRASAD";
        break;
      case "vvp":
        selectedLabel = "V VEERA PRASAD";
        break;
      case "pns":
        selectedLabel = "PNS LAKSHMI";
        break;
      case "gsn":
        selectedLabel = "GSN MURTHY";
        break;
      case "rk":
        selectedLabel = "B RAMAKRISHNA";
        break;
      default:
        selectedLabel = "";
        break;
}
        res.render('sample.pug',{"name":selectedLabel,"avg":avg});
});
