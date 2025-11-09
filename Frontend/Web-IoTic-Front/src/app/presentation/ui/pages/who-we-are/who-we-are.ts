import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Header } from '../../templates/header/header';
import { time } from 'console';
import { deserialize } from 'v8';
import { title } from 'process';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-who-we-are',
  imports: [CommonModule, Header],
  templateUrl: './who-we-are.html',
  styleUrl: './who-we-are.css'
})
export class WhoWeAre implements OnInit{
    public options: any = [
    {
      title: 'Misión',
      description: 'El GTI es un grupo de gestión y apoyo a todas las actividades encaminadas a la investigación en Tecnologías de Información en la Universidad del Cauca, brindando la posibilidad a todo el personal docente, administrativo y estudiantil de tener espacios de adquisición, generación y construcción del conocimiento mediante proyectos que representen el interés de estamentos internos y externos a la Universidad.',
    },
    {
      title: 'Visión',
      description: 'Preservar y estimular el crecimiento de la capacidad de investigación e innovación en el área las Tecnologías de la Información de la Universidad del Cauca, a través de los integrantes del grupo GTI, por medio de la creación de espacios adecuados donde la crítica y el debate intelectual se constituyan en fuente de nuevo conocimiento. El GTI promoverá el desarrollo de su talento humano (profesores, investigadores y estudiantes), aportará la infraestructura requerida y establecerá alianzas estratégicas con centros de investigación de reconocido prestigio internacional para el desarrollo de su labor, con el propósito de agregar valor a su relación con la sociedad. Los principios de calidad, transparencia, independencia de criterio, compromiso y servicio, orientarán las actuaciones del GTI y se constituirán en su diferencial competitivo con respecto de otros grupos en el área. A largo plazo el GTI pretende ser: “Un centro tecnológico en Investigación y Desarrollo con reconocimiento nacional e internacional generador de proyectos y servicios relacionados con las tecnologías de información en el ámbito de la sociedad global de la información, destacándose por la constante formación de investigadores.”',
    },
    {
      title: 'Valores',
      description: {
        'Curiosidad:': 'Interés por tratar de comprender las verdades que se encierran detrás de cada tema de los proyectos que se ejecuten.',
        'Innovación:': 'Capacidad de generar proyectos que aporten nuevos conocimientos y experiencias al área de Tecnologías de Información.',
        'Responsabilidad':'Para cumplir con las políticas al interior del Grupo.',
        'Respeto:': 'Por toda persona que interactúe con el Grupo y por todo trabajo que se realice al interior y exterior del mismo.',
        'Humildad:': 'Reconocer los méritos de los trabajos investigativos que se realizan al interior y exterior del grupo. Ética: Tener siempre presente lo que es moral y profesionalmente correcto. ',
        'Honestidad:': 'Es la demostración en la práctica diaria que garantiza confianza, seguridad, respaldo y confidencialidad; en otras palabras, integridad.',
      }
    },
  ];
  public objetivos: any = [{
    title: 'Fortalecimiento Interno',
    description: 'Fortalecer la infraestructura humana, técnica, investigativa y de formación especializada en diferentes áreas, de todo el Grupo de Investigación de Unicauca.',
  },
  {
    title: 'Interdisciplinariedad Académica',
    description: 'Definir, diseñar e implementar proyectos que propendan por la interdisciplinariedad de áreas dentro y fuera de La universidad Del Cauca.',
  },
  {
    title:'Interdisciplinariedad Académica',
    description: 'Fomentar la investigación y el desarrollo de los estudiantes de Unicauca, especialmente del programa de Ingeniería de Sistemas, en cuanto a áreas de Tecnologías de Información se refiere, utilizando para ello las propuestas de proyectos de grado.'
  },
  {
    title: 'Divulgación Científica',
    description: 'Desarrollar estrategias de divulgación, mediante la participación de los integrantes del Grupo en eventos y publicaciones de alta calidad en el área de Tecnologías de la Información.'
  },
  {
    title: 'Redes Académicas',
    description: 'Establecer Redes Temáticas de Aprendizaje y convenios a través de vínculos con Grupos de Investigación de universidades reconocidas.'
  },
  {
    title: 'Integración Docente ',
    description: 'Aplicar los conocimientos adquiridos en los diferentes proyectos, a los cursos impartidos en el pregrado de Ingeniería de Sistemas.'  
  },
  {
    title: 'Impacto Social',
    description: 'Desarrollar proyectos que propendan por la búsqueda de soluciones a problemas que causen impacto social, apoyando con las Tecnologías de Información las actividades y requerimientos propios de la comunidad en general.'
  }
  
  ]
  history: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
   this.http.get('assets/historia.txt', { responseType: 'text' })
      .subscribe((data) => {
        this.history = data;
      });
  }
  objectKeys = Object.keys;

}
