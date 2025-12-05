import { CommonModule } from '@angular/common';
import { Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { BooksService } from '../../../../services/information/books.service';
import { ImagesService } from '../../../../services/common/images.service';
import { ActivatedRoute } from '@angular/router';
import { FormBook } from '../../templates/form-book/form-book';
import { switchMap } from 'rxjs/operators';
import { BaseProductivityDTO } from '../../../../models/Common/BaseProductivityDTO';
import { LoadingService } from '../../../../services/loading.service';

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
   * Mapeo de tipos a componentes de formulario
   *
   */
  formMap: any = {
    libro: FormBook
  };

  isLoading: boolean = false;

  /**
   * Constructor donde se llamaran todos lo servicios necesarios por formulario
   * @param router 
   * @param loadingService 
   * @param booksService 
   * @param imageService 
   */
  constructor(
    private router: ActivatedRoute,
    public loadingService: LoadingService,
    private booksService: BooksService,
    private imageService: ImagesService
  ) { }

  ngOnInit(): void {
      this.router.paramMap.subscribe(params => {
      const tipoParam = params.get('tipo');
      if (tipoParam) {
        this.tipo = tipoParam;
      }else {
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
    this.currentFormRef.instance.formSubmit.subscribe((payload: {data: BaseProductivityDTO, file: File | null }) => {
      console.log("Formulario recibido en padre:", payload);
      this.onFormSubmit(payload);
    });
  }

  /**
   * Recibe desde el hijo:
   * {
   *   data: {...fields} que va a ser BaseProductivityDTO como padre, recibe cualquier hijo,
   *   file: File | null
   * }
   */
  onFormSubmit({ data, file }: { data: BaseProductivityDTO, file: File | null }) {
    this.isLoading = true;

    // Si no hay imagen → guardar de una
    if (!file) {
      this.guardarEntidad(data);
      return;
    }

    const extension = file.name.split('.').pop() || 'jpg';
    const contentType = file.type;

    this.imageService.getPresignedUrl(extension, contentType)
      .pipe(
        switchMap((resp) => {
          const uploadUrl = resp.upload_url;
          const filePath = resp.file_path;
          data.file_path = filePath;
          return this.imageService.uploadToR2(uploadUrl, file);
        })
      )
      .subscribe({
        next: () => {
          this.guardarEntidad(data);
        },
        error: (err) => {
          console.error("Error subiendo imagen:", err);
          this.isLoading = false;
        }
      });
  }

  /**
   *  Guarda la entidad dependiendo del tipo, se debe colocar en cada caso el servicio correspondiente
   * @param payload Datos del formulario ya con image_url si aplica
   */
  guardarEntidad(payload: any) {
    switch (this.tipo) {
      case 'libro':
        console.log("Guardando libro:", payload);
        this.booksService.postBook(payload).subscribe({
          next: () => this.isLoading = false,
          error: () => this.isLoading = false
        });
        break;
      
      // Aquí agregas tus 14 servicios extra
    }
  }

}
