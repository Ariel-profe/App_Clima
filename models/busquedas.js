const fs = require('fs');

const axios = require("axios");

class Busquedas {
  historial = []; 
  dbPath = './db/database.json'  //ruta para poder guardar historial de busquedas

  constructor() {
    return this.leerDB();
  }

  get historialCapitalizado(){ //Convertir la primer letra en mayusculas
    return this.historial.map(lugar=>{
      let palabras = lugar.split(' ');//Método para cortar cada oracion por los espacios entre palabras
      palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1)); //se manejan las palabras como
      //un array

      return palabras.join(' ');//metodo para unir las palabras por un espacio, contrario al split
    }) 

  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      //Se realiza la peticion HTTP
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instance.get();

      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
      //debe regresar un arreglo con todos los lugares
      //que coincidan con el lugar que escribio la persona
    } catch (error) {
      return [];
    }
  }

  get paramsOW() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es"
    };
  }

  async climaLugar(lat, lon) {
    try {
      //Peticion HTTP
      const instance = axios.create({
        baseURL: "https://api.openweathermap.org/data/2.5/weather",
        params: {...this.paramsOW, lat, lon}
      });

      const resp = await instance.get();
      const {weather, main} = resp.data;

      return{
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp
        //Estos datos vienen desde la info de la pag, lo muestra en PostMan
      }
      


    } catch (error) {
      console.log(error);
    }
  }

agregarHistorial (lugar = ''){
//Prevenir duplicados

if(this.historial.includes(lugar.toLocaleLowerCase())){//Si existe el lugar ya buscado en el historial, return de nada porque no tiene q grabar nada
  return;
}

this.historial.unshift(lugar.toLocaleLowerCase());//Si no existe, se guarda en la primera posicion del arreglo

//Grabar en DataBase
this.guardaDB();
}

guardaDB(){

  const payload = {
    historial: this.historial
  };

  fs.writeFileSync(this.dbPath, JSON.stringify(payload));

}

leerDB(){
  if(!fs.existsSync(this.dbPath)) return; //Si db path no existe, retorne null

  //PERO si existe, haga esta funcion de abajo
     
  const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'})
    const data = JSON.parse(info); //se toma ese objeto y lo parsea, lo convierte a json para poder leerse
    this.historial = data.historial;
    
  }
}



module.exports = Busquedas;
