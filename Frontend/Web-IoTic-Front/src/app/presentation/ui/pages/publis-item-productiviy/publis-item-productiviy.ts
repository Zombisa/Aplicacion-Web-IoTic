import { CommonModule } from '@angular/common';
import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { BooksService } from '../../../../services/information/books.service';
import { ImagesService } from '../../../../services/common/images.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBook } from '../../templates/form-book/form-book';
import { switchMap } from 'rxjs/operators';
import { BaseProductivityDTO } from '../../../../models/Common/BaseProductivityDTO';
import { LoadingService } from '../../../../services/loading.service';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { FormCapBook } from '../../templates/form-cap-book/form-cap-book';
import { CapBookService } from '../../../../services/information/cap-book.service';
import { BookPeticion } from '../../../../models/Peticion/BookPeticion';
import { CapBookPeticion } from '../../../../models/Peticion/CapBookPeticion';
import Swal from 'sweetalert2';
import { FormEvaluacion } from '../../templates/form-evaluacion/form-evaluacion';
import { ParticipacionComitesEvService } from '../../../../services/information/participacion-comites-ev.service';
import { ParticipacionComitesEvPeticion } from '../../../../models/Peticion/informacion/ParticipacionComitesEvPeticion';


@Component({
  selector: 'app-publis-item-productiviy',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './publis-item-productiviy.html',
  styleUrl: './publis-item-productiviy.css'
})
export class PublisItemProductiviy implements OnInit {

  tipo: string = '';
  currentFormRef!: ComponentRef<any>;

  @ViewChild('formContainer', { read: ViewContainerRef })
  formContainer!: ViewContainerRef;
  /**
   * ===========FLUJO DE TRABAJO =================
   * 1. registrar el formulario dentrode formMap, clave: componente
   * 2. incluir el servicio necesario en el constructor dentro de guardarMap (estructura docuentada abajo)
   * 3. agregar el tipo en el panel de seleccion de tipos (panel-publish-productivity.ts)
   * =============================================
   * 
   *======== TODOS ============ los formularios deben emitir un FormSubmitPayload
   * en el cual estan los campos para imagenes y documentos opcionales
   * DOCUMENTO AUN FALTA IMPLEMENTAR
   * IMAGEN LISTA 
   * 
   */

  /**
   * Mapeo de tipos a componentes de formulario
   * se debe agregar el componente correspondiente para cada nuevo tipo de productividad
   * el tipo de productividad debe coincidir con el parametro 'tipo' en la URL
   * ejemplo: 'book' -> FormBook, 'cap_book' -> FormCapBook
   * la clave es el tipo y el valor es el componente del formulario
   *
   *
   */
  formMap: any = {
    libro: FormBook,
    capitulo_libro: FormCapBook,
    participacion_comites_ev: FormEvaluacion,
  };

  isLoading: boolean = false;

  /**
   * Constructor donde se llamaran todos lo servicios necesarios por formulario
   * @param router  se usa para capturar el parametro de tipo en la URL
   * @param loadingService maneja el estado de carga global pagina de carga
   * @param booksService servicio de libros
   * @param imageService servicio de subida de imagenes
   */
  constructor(
    private router: ActivatedRoute,
    public loadingService: LoadingService,
    private booksService: BooksService,
    private imageService: ImagesService,
    private capBookService: CapBookService,
    private participacionComitesEvService: ParticipacionComitesEvService,
    private route: Router
    /**
     * Agregar servicios necesarios para cada tipo de formulario
     * private servicioEjemplo: ServicioEjemplo
     * private otroServicio: OtroServicio
     */
  ) { }

  ngOnInit(): void {
    this.router.paramMap.subscribe(params => {
      const tipoParam = params.get('tipo');
      if (tipoParam) {
        this.tipo = tipoParam;
      } else {
        console.error('Tipo de productividad no proporcionado en la URL.');
      }
    });
  }
  ngAfterViewInit(): void {
    // Espera un ciclo para asegurar que formContainer ya existe
    setTimeout(() => {
      if (this.tipo) {
        this.cargarFormulario();
      }
    });
  }

  /**
   * Crea el componente y escucha que envie el formulario
   * @returns 
   */
  cargarFormulario() {
    const formComponent = this.formMap[this.tipo];

    if (!formComponent) {
      console.error('No hay formulario para el tipo:', this.tipo);
      return;
    }

    this.formContainer.clear();

    this.currentFormRef = this.formContainer.createComponent(formComponent);

    // El hijo enviará: { data: {...}, file: File | null }
    this.currentFormRef.instance.formSubmit.subscribe((payload: FormSubmitPayload) => {
      console.log("Formulario recibido en padre:", payload);
      this.onFormSubmit(payload);
    });
  }

  /**
   * Recibe desde el hijo:
   * Comprime la imagen si existe, la sube a R2 y guarda la entidad
   * guardando la ruta en el objeto data
   * es necesario que el hijo envie un objeto con la estructura BaseProductivityDTO
   * @param dtoSubmit objeto con la informacion traida del fomrulario en formato especifico y la imagen  del hijo
   */
  async onFormSubmit(dtoSubmit: FormSubmitPayload) {
    this.isLoading = true;

    if (!dtoSubmit.file_image) {
      this.guardarEntidad(dtoSubmit.data);
      return;
    }

    try {
      /**PROCESO PATA SUBIR Y COMPRIMIR IMAGNES */
      const compressed = await this.compressFile(dtoSubmit.file_image!);
      await this.uploadAndSetImage(dtoSubmit.data, compressed);
      this.guardarEntidad(dtoSubmit.data);

    } catch (error) {
      console.error("Error al subir la imagen:", error);
      this.isLoading = false;
    }
  }
  /**
   * Comprime el archivo de imagen antes de subirlo
   * @param file archivo de la imagen a comprimir
   * @returns la imagen comprimida
   */
  private compressFile(file: File): Promise<File> {
    return this.imageService.compressImage(file, 0.7, 1500);
  }
  /**
   * funcion que sube la imagen comprimida a R2 y actualiza el objeto data con la ruta
   * @param data objeto de datos donde se colocara la ruta de la imagen subida
   * @param file imagen comprimida a subir
   * @returns 
   */
  private uploadAndSetImage(data: BaseProductivityDTO, file: File): Promise<void> {
    const extension = file.name.split('.').pop() || 'jpg';
    const contentType = file.type;

    return new Promise((resolve, reject) => {
      this.imageService.getPresignedUrl(extension, contentType)
        .pipe(
          switchMap((resp) => {
            console.log(resp)
            data.image_path = resp.file_path;
            return this.imageService.uploadToR2(resp.upload_url, file);
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            // Mostrar notificación de error
            Swal.fire({
              icon: 'error',
              title: 'Error al subir la imagen',
              text: 'No se pudo subir la imagen. Por favor intenta nuevamente.',
              confirmButtonText: 'Aceptar'
            });
            reject(err);
          }
        });
    });
  }
  /**
   * Muestra un mensaje de exito al usuario
   * @param titulo titulo de la notificación
   * @param mensaje mensaje de la notificación personalizado
   */
  private mostrarExito(titulo: string, mensaje: string) {
    Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'btn btn-primary'
      }
    }).then(() => {
      this.route.navigate(['/productividad']);
    });
  }
  /**
   * Muestra un mensaje de error al usuario
   * @param titulo titulo de la notificación
   * @param mensaje mensaje de la notificación personalizado
   */
  private mostrarError(titulo: string, mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'btn btn-primary'
      }
    });
  }


  /**
   *  Guarda la entidad dependiendo del tipo, se debe colocar en cada caso el servicio correspondiente
   * segun el tipo de productividad dispara un servicio u otro conviritiendo el payload al tipo de peticion correspondiente
   * siempre usar asignacion de tipos para asegurar que el objeto payload cumple con la estructura requerida no usar any
   * @param payload Datos del formulario ya con image_url si aplica
   * @example
   * EXAMPLE: (payload: BaseProductivityDTO) => {
      this.EXAMPLEService.postEXAMPLE(payload as EXAMPLEPeticion).subscribe({
        next: () => this.mostrarExito('Libro guardado', 'EXAMPLE se ha guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar EXAMPLE', 'No se pudo guardar el EXAMPLE.')
      });
    }
   */
  private guardarMap: Record<string, (payload: BaseProductivityDTO) => void> = {
    libro: (payload: BaseProductivityDTO) => {
      this.booksService.postBook(payload as BookPeticion).subscribe({
        next: () => this.mostrarExito('Libro guardado', 'El libro se ha guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar el libro', 'No se pudo guardar el libro.')
      });
    },
    capitulo_libro: (payload: BaseProductivityDTO) => {
      this.capBookService.postCapBook(payload as CapBookPeticion).subscribe({
        next: () => this.mostrarExito('Capítulo de libro guardado', 'El capítulo se ha guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar el capítulo', 'No se pudo guardar el capítulo.')
      });
    },
    participacion_comites_ev: (payload: BaseProductivityDTO) => {
      this.participacionComitesEvService.create(payload as ParticipacionComitesEvPeticion).subscribe({
        next: () =>
          this.mostrarExito(
            'Participación guardada',
            'La participación en comité de evaluación se ha guardado correctamente.'
          ),
        error: () =>
          this.mostrarError(
            'Error al guardar la participación',
            'No se pudo guardar la participación en comité de evaluación.'
          )
      });
    }
  };


  /**
   * guarda la entidad dependiendo del tipo, se debe colocar en cada caso el servicio correspondiente
   * segun el tipo de productividad dispara un servicio u otro conviritiendo el payload al tipo de peticion correspondiente
   * siempre usar asignacion de tipos para asegurar que el objeto payload cumple con la estructura requerida no usar any
   * @param payload Datos del formulario ya con image_url si aplica
   * @returns 
   */
  guardarEntidad(payload: BaseProductivityDTO) {
    this.isLoading = true;
    const guardarFn = this.guardarMap[this.tipo];

    if (!guardarFn) {
      console.error('No hay servicio definido para tipo:', this.tipo);
      this.isLoading = false;
      return;
    }

    guardarFn(payload);
  }

}
