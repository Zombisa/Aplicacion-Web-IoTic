import { ElectronicComponent } from '../models/electronicComponent.model';

export const MOCK_COMPONENTS: ElectronicComponent[] = [
  {
    id: 1,
    numSerie: 'MCU-UNO',
    descripcion: 'Arduino Uno',
    cantidad: 5,
    ubicacion: 'Armario 1 - Lab IoTIC',
    estadoFisico: 'Excelente',
    estadoAdministrativo: 'Disponible',
    observacion: 'Placa de desarrollo para proyectos de IoT',
    imagenArticulo: 'OC-2024-0021'
  },
  {
    id: 2,
    numSerie: 'SEN-DHT11',
    descripcion: 'Sensor DHT11',
    cantidad: 15,
    ubicacion: 'Cajón Sensores A',
    estadoFisico: 'Bueno',
    estadoAdministrativo: 'Disponible',
    observacion: 'Sensor de temperatura y humedad',
    imagenArticulo: 'OC-2024-0021'
  }
];
