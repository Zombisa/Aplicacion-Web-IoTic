import { CommonModule } from '@angular/common';
import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { BooksService } from '../../../../services/information/books.service';
import { ImagesService } from '../../../../services/common/images.service';
import { FilesService } from '../../../../services/common/files.service';
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
import { TutoriaEnMarchaService } from '../../../../services/information/tutoria-en-marcha.service';
import { TrabajoEventosService } from '../../../../services/information/trabajo-eventos.service';
import { TutoriaConcluidaService } from '../../../../services/information/tutoria-concluida.service';
import { SoftwareService } from '../../../../services/information/software.service';
import { RevistaService } from '../../../../services/information/revista.service';
import { ProcesoTecnicaService } from '../../../../services/information/proceso-tecnica.service';
import { ProcesoTecnicaPeticion } from '../../../../models/Peticion/informacion/ProcesoTecnicaPeticion';
import { RevistaPeticion } from '../../../../models/Peticion/informacion/RevistaPeticion';
import { SoftwarePeticion } from '../../../../models/Peticion/informacion/SoftwarePeticion';
import { TrabajoEventosPeticion } from '../../../../models/Peticion/informacion/TrabajoEventosPeticion';
import { TutoriaConcluidaPeticion } from '../../../../models/Peticion/informacion/TutoriaConcluidaPeticion';
import { TutoriaEnMarchaPeticion } from '../../../../models/Peticion/informacion/TutoriaEnMarchaPeticion';
import { FormProcesoTecnica } from '../../templates/form-proceso-tecnica/form-proceso-tecnica';
import { FormRevista } from '../../templates/form-revista/form-revista';
import { FormSoftware } from '../../templates/form-software/form-software';
import { FormTrabajoEventos } from '../../templates/form-trabajo-eventos/form-trabajo-eventos';
import { FormTutoriaConcluida } from '../../templates/form-tutoria-concluida/form-tutoria-concluida';
import { FormTutoriaEnMarcha } from '../../templates/form-tutoria-en-marcha/form-tutoria-en-marcha';

import { FormCurso } from '../../templates/form-curso/form-curso';
import { FormMaterialDidactico } from '../../templates/form-material-didactico/form-material-didactico';
import { FormJurado } from '../../templates/form-jurado/form-jurado';
import { FormEvento } from '../../templates/form-evento/form-evento';

import { CursoService } from '../../../../services/information/curso.service';
import { MaterialDidacticoService } from '../../../../services/information/material-didactico.service';
import { JuradoService } from '../../../../services/information/jurado.service';
import { EventoService } from '../../../../services/information/evento.service';

import { CursoPeticion } from '../../../../models/Peticion/informacion/CursoPeticion';
import { MaterialDidacticoPeticion } from '../../../../models/Peticion/informacion/MaterialDidacticoPeticion';
import { JuradoPeticion } from '../../../../models/Peticion/informacion/JuradoPeticion';
import { EventoPeticion } from '../../../../models/Peticion/informacion/EventoPeticion';
import { AuthService } from '../../../../services/auth.service';
import { DeleteHelperService } from '../../../../services/common/delete-helper.service';
import { ConfirmationModal } from '../../templates/confirmation-modal/confirmation-modal';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit-item-productiviy',
  imports: [CommonModule, Header, LoadingPage, ConfirmationModal],
  templateUrl: './edit-item-productiviy.html',
  styleUrl: './edit-item-productiviy.css'
})
export class EditProductiviy implements OnInit {

  tipo: string = '';
  id!: number;
  currentFormRef!: ComponentRef<any>;

  @ViewChild('formContainer', { read: ViewContainerRef })
  formContainer!: ViewContainerRef;
  formMap: Record<string, any> = {
    libro: FormBook,
    capitulo: FormCapBook,
    'participacion-comites': FormEvaluacion,
    'proceso-tecnica': FormProcesoTecnica, 
    revista: FormRevista,
    software: FormSoftware,
    'trabajo-eventos': FormTrabajoEventos,
    tutoria_en_marcha: FormTutoriaEnMarcha,
    tutoria_concluida: FormTutoriaConcluida,
    curso: FormCurso,
    material_didactico: FormMaterialDidactico,
    jurado: FormJurado,
    evento: FormEvento
  };


  isLoading: boolean = false;
  public showDeleteModal = false;
  public isAdminOrMentor$: Observable<boolean>;
  private isDeleting = false;
  public deleteModalMessage = '';

  constructor(
    private router: ActivatedRoute,
    public loadingService: LoadingService,
    private booksService: BooksService,
    private imageService: ImagesService,
    private filesService: FilesService,
    private capBookService: CapBookService,
    private participacionComitesEvService: ParticipacionComitesEvService,
    private tutoriaEnMarchaService: TutoriaEnMarchaService,
    private tutoriaConcluidaService: TutoriaConcluidaService,
    private trabajoEventosService: TrabajoEventosService,
    private softwareService: SoftwareService,
    private revistaService: RevistaService,
    private procesoTecnicaService: ProcesoTecnicaService,
    private cursoService: CursoService,
    private materialDidacticoService: MaterialDidacticoService,
    private juradoService: JuradoService,
    private eventoService: EventoService,
    private route: Router,
    private authService: AuthService,
    private deleteHelper: DeleteHelperService
  ) {
    this.isAdminOrMentor$ = this.authService.isAdminOrMentor();
  }

  ngOnInit(): void {
  this.router.paramMap.subscribe(params => {
    this.tipo = params.get('tipo') ?? '';

    const idParam = params.get('id');
    this.id =  Number(idParam) ;

    console.log("ID (number):", this.id);
  });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.tipo) {
        this.cargarFormulario();
      }
    });
  }
  /**
   *  
   * @returns Carga el formulario dinámicamente según el tipo de productividad
   */
  cargarFormulario() {
    const formComponent = this.formMap[this.tipo];

    if (!formComponent) {
      console.error('No hay formulario para el tipo:', this.tipo);
      return;
    }

    this.formContainer.clear();

    this.currentFormRef = this.formContainer.createComponent(formComponent);
    this.currentFormRef.instance.editMode = true; 
      this.currentFormRef.instance.idInput = this.id;   

    this.currentFormRef.instance.formSubmit.subscribe((payload: FormSubmitPayload) => {
      console.log("Formulario recibido en padre:", payload);
      this.onFormSubmit(payload);
    });
  }
  /**
   * se ejecuta al enviar el formulario desde el componente hijo
   * @param dtoSubmit Datos enviados desde el formulario hijo
   */
  async onFormSubmit(dtoSubmit: FormSubmitPayload) {
    this.isLoading = true;
    this.loadingService.show();
    try {
      // Imagen
      if (dtoSubmit.file_image) {
        const compressed = await this.compressFile(dtoSubmit.file_image!);
        await this.uploadAndSetImage(dtoSubmit.data, compressed);
      }

      // Archivo
      if (dtoSubmit.file_document) {
        await this.uploadAndSetFile(dtoSubmit.data, dtoSubmit.file_document);
      }

      this.guardarEntidad(dtoSubmit.data);
      this.loadingService.hide();
    } catch (error) {
      console.error("Error al subir archivos:", error);
      this.isLoading = false;
      this.loadingService.hide();
    }
  }

  private compressFile(file: File): Promise<File> {
    return this.imageService.compressImage(file, 0.7, 1500);
  }

  /**
   * 
   * @param data datos del tiop a guardar
   * @param file imagena guardar dentro del item 
   * @returns 
   */
  private uploadAndSetImage(data: BaseProductivityDTO, file: File): Promise<void> {
    const extension = file.name.split('.').pop() || 'jpg';
    const contentType = file.type;

    return new Promise((resolve, reject) => {
      this.imageService.getPresignedUrl(extension, contentType)
        .pipe(
          switchMap((resp) => {
            data.image_path = resp.file_path;
            console.log("Ruta de la imagen establecida en el data:", data.image_path);
            return this.imageService.uploadToR2(resp.upload_url, file);
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al subir la imagen',
              text: 'No se pudo subir la imagen.',
              confirmButtonText: 'Aceptar'
            });
            reject(err);
          }
        });
    });
  }
  /**
   * Toma el archivo lo sube  a R2 Y lo guarda dentro del dto para el  backend
   * @param data datos del tipo a guardar
   * @param file arvchivo a guardar en R2
   * @returns 
   */
  private uploadAndSetFile(data: BaseProductivityDTO, file: File): Promise<void> {
    const extension = file.name.split('.').pop() || 'pdf';
    const contentType = file.type;

    return new Promise((resolve, reject) => {
      this.filesService.getPresignedUrl(extension, contentType)
        .pipe(
          switchMap((resp) => {
            
            data.archivo_path = resp.file_path;
            console.log("respo filepath:",resp.upload_url);
            return this.filesService.uploadToR2(resp.upload_url, file);
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al subir archivo',
              text: 'No se pudo subir el archivo.',
              confirmButtonText: 'Aceptar'
            });
            reject(err);
          }
        });
    });
  }

  private mostrarExito(titulo: string, mensaje: string) {
    Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      buttonsStyling: true
    }).then(() => {
      this.route.navigate(['/productividad/panel']);
    });
  }

  private mostrarError(titulo: string, mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      buttonsStyling: true
    });
  }
  /**
   * funcion para 
   */
  private guardarMap: Record<string, (payload: BaseProductivityDTO) => void> = {
    libro: (payload) => {
      this.booksService.editBook(this.id, payload as BookPeticion).subscribe({
        next: () => this.mostrarExito('Libro guardado', 'El libro se ha guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar libro', 'No se pudo guardar el libro.')
      });
    },

    capitulo: (payload) => {
      this.capBookService.editCapBook(this.id, payload as CapBookPeticion).subscribe({
        next: () => this.mostrarExito('Capítulo guardado', 'El capítulo se ha guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar capítulo', 'No se pudo guardar el capítulo.')
      });
    },

    'participacion-comites': (payload) => {
      this.participacionComitesEvService.update(this.id ,payload as ParticipacionComitesEvPeticion).subscribe({
        next: () => this.mostrarExito('Participación guardada', 'Datos guardados correctamente.'),
        error: () => this.mostrarError('Error al guardar participación', 'No se pudo guardar.')
      });
    },

    tutoria_en_marcha: (payload) => {
      this.tutoriaEnMarchaService.update(this.id ,payload as TutoriaEnMarchaPeticion).subscribe({
        next: () => this.mostrarExito('Tutoría en marcha guardada', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    },

    tutoria_concluida: (payload) => {
      this.tutoriaConcluidaService.update(this.id ,payload as TutoriaConcluidaPeticion).subscribe({
        next: () => this.mostrarExito('Tutoría concluida guardada', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    },

    'trabajo-eventos': (payload) => {
      this.trabajoEventosService.update(this.id ,payload as TrabajoEventosPeticion).subscribe({
        next: () => this.mostrarExito('Trabajo guardado', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    },

    software: (payload) => {
      this.softwareService.update(this.id ,payload as SoftwarePeticion).subscribe({
        next: () => this.mostrarExito('Software guardado', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    },

    revista: (payload) => {
      this.revistaService.update(this.id ,payload as RevistaPeticion).subscribe({
        next: () => this.mostrarExito('Revista guardada', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    },

    'proceso-tecnica': (payload) => {
      this.procesoTecnicaService.update(this.id ,payload as ProcesoTecnicaPeticion).subscribe({
        next: () => this.mostrarExito('Proceso técnico guardado', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    },

    curso: (payload) => {
      this.cursoService.update(this.id ,payload as CursoPeticion).subscribe({
        next: () => this.mostrarExito('Curso guardado', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar curso', 'No se pudo guardar.')
      });
    },

    material_didactico: (payload) => {
      this.materialDidacticoService.update(this.id ,payload as MaterialDidacticoPeticion).subscribe({
        next: () => this.mostrarExito('Material didáctico guardado', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    },

    jurado: (payload) => {
      this.juradoService.update(this.id ,payload as JuradoPeticion).subscribe({
        next: () => this.mostrarExito('Jurado guardado', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    },

    evento: (payload) => {
      this.eventoService.update(this.id ,payload as EventoPeticion).subscribe({
        next: () => this.mostrarExito('Evento guardado', 'Guardado correctamente.'),
        error: () => this.mostrarError('Error al guardar', 'No se pudo guardar.')
      });
    }
  };
  /**
   * funcion encargada de guardar el item en el back
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

  /**
   * Obtener el observable de eliminación según el tipo de publicación
   */
  private getDeleteObservable(tipo: string, id: number): Observable<any> | null {
    switch (tipo) {
      case 'libro':
        return this.booksService.deleteBook(id);
      case 'capitulo':
        return this.capBookService.deleteCapBook(id);
      case 'participacion_comites_ev':
        return this.participacionComitesEvService.delete(id);
      case 'tutoria_en_marcha':
        return this.tutoriaEnMarchaService.delete(id);
      case 'tutoria_concluida':
        return this.tutoriaConcluidaService.delete(id);
      case 'trabajo_eventos':
        return this.trabajoEventosService.delete(id);
      case 'software':
        return this.softwareService.delete(id);
      case 'revista':
        return this.revistaService.delete(id);
      case 'proceso-tecnica':
        return this.procesoTecnicaService.delete(id);
      case 'curso':
        return this.cursoService.delete(id);
      case 'material_didactico':
        return this.materialDidacticoService.delete(id);
      case 'jurado':
        return this.juradoService.delete(id);
      case 'evento':
        return this.eventoService.delete(id);
      default:
        return null;
    }
  }

  /**
   * Obtener el nombre del item según el tipo
   */
  private getItemName(tipo: string): string {
    const nameMap: Record<string, string> = {
      libro: 'libro',
      capitulo: 'capítulo',
      participacion_comites_ev: 'participación',
      tutoria_en_marcha: 'tutoría',
      tutoria_concluida: 'tutoría',
      trabajo_eventos: 'trabajo',
      software: 'software',
      revista: 'revista',
      'proceso-tecnica': 'proceso técnico',
      curso: 'curso',
      material_didactico: 'material didáctico',
      jurado: 'jurado',
      evento: 'evento'
    };
    return nameMap[tipo] || 'publicación';
  }

  /**
   * Mostrar modal de confirmación para eliminar publicación
   */
  confirmDelete(): void {
    const itemName = this.getItemName(this.tipo);
    const itemNameCapitalized = itemName.charAt(0).toUpperCase() + itemName.slice(1);
    this.deleteModalMessage = `
      <div style="text-align: center;">
        <p style="margin-bottom: 1rem; font-size: 1.1rem;">
          ¿Estás seguro de que deseas eliminar esta <strong>${itemNameCapitalized}</strong>?
        </p>
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; border-radius: 4px; margin-top: 1rem;">
          <p style="margin: 0; color: #856404; font-size: 0.95rem;">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Advertencia:</strong> Esta acción no se puede deshacer y se eliminarán todos los datos asociados, incluyendo imágenes y archivos.
          </p>
        </div>
      </div>
    `;
    this.showDeleteModal = true;
  }

  /**
   * Ejecutar eliminación de la publicación tras confirmación usando el servicio helper
   */
  onDeleteConfirmed(): void {
    if (this.isDeleting) {
      return;
    }

    const deleteObservable = this.getDeleteObservable(this.tipo, this.id);
    if (!deleteObservable) {
      console.error('No hay servicio de eliminación definido para tipo:', this.tipo);
      Swal.fire('Error', 'No se puede eliminar este tipo de publicación.', 'error');
      return;
    }

    this.isDeleting = true;
    this.showDeleteModal = false;

    const itemName = this.getItemName(this.tipo);
    
    this.deleteHelper.deleteItem(
      deleteObservable,
      this.id,
      itemName,
      '/productividad/panel'
    ).finally(() => {
      this.isDeleting = false;
    });
  }

  /**
   * Cancelar eliminación de la publicación
   */
  onDeleteCancelled(): void {
    this.showDeleteModal = false;
  }

}
