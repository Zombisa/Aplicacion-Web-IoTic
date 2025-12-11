Aqui se encuentran las URLS de los endpoints disponibles para cada servicio
ejemplo practico de como llamar en los servicios:

constructor(private http: HttpClient, private config: AppConfigService) {}

El http servira para hacer las llamadas http de los enpoitn,
config, es un servicio declarado para la lectura de las url colocadas en el config.json, se carga primero con el inicialaicer 