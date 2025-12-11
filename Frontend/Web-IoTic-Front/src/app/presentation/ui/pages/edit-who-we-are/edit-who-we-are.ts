import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { FormEditSingleContent } from '../../templates/form-edit-single-content/form-edit-single-content';
import { FormEditMultipleItems, ItemData } from '../../templates/form-edit-multiple-items/form-edit-multiple-items';
import { WhoWeAreService } from '../../../../services/who-we-are.service';
import { LoadingService } from '../../../../services/loading.service';
import { MisionDTO } from '../../../../models/DTO/MisionDTO';
import { VisionDTO } from '../../../../models/DTO/VisionDTO';
import { HistoriaDTO } from '../../../../models/DTO/HistoriaDTO';
import { ObjetivoDTO } from '../../../../models/DTO/ObjetivoDTO';
import { ValorDTO } from '../../../../models/DTO/ValorDTO';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-edit-who-we-are',
    imports: [
      CommonModule,
      Header,
      LoadingPage,
      FormEditSingleContent,
      FormEditMultipleItems,
      MatIconModule
    ],
    templateUrl: './edit-who-we-are.html',
    styleUrl: './edit-who-we-are.css',
  })

  export class EditWhoWeAre implements OnInit {

    public mision: MisionDTO | null = null;
    public vision: VisionDTO | null = null;
    public historia: HistoriaDTO | null = null;
    public objetivos: ObjetivoDTO[] = [];
    public valores: ValorDTO[] = [];
  

    isLoadingMision: boolean = false;
    isLoadingVision: boolean = false;
    isLoadingHistoria: boolean = false;
    isLoadingObjetivos: boolean = false;
    isLoadingValores: boolean = false;
  
    constructor(
      private whoWeAreService: WhoWeAreService,
      public loadingService: LoadingService,
      private router: Router
    ) {}
    ngOnInit(): void {
        this.loadData();
      }
    

      private loadData(): void {
        this.loadingService.show();
    
        this.whoWeAreService.getMision().subscribe({
          next: (data) => {
            if (data && 'id' in data) {
              this.mision = data;
            }
          },
          error: (error) => {
            console.error('Error al cargar misión:', error);
          }
        });

        this.whoWeAreService.getVision().subscribe({
            next: (data) => {
              if (data && 'id' in data) {
                this.vision = data;
              }
            },
            error: (error) => {
              console.error('Error al cargar visión:', error);
            }
          });
          this.whoWeAreService.getHistoria().subscribe({
            next: (data) => {
              if (data && 'id' in data) {
                this.historia = data;
              }
              this.loadingService.hide();
            },
            error: (error) => {
              console.error('Error al cargar historia:', error);
              this.loadingService.hide();
            }
          });   
          this.whoWeAreService.getObjetivos().subscribe({
            next: (data) => {
              this.objetivos = data || [];
            },
            error: (error) => {
              console.error('Error al cargar objetivos:', error);
            }
          });  
          this.whoWeAreService.getValores().subscribe({
            next: (data) => {
              this.valores = data || [];
            },
            error: (error) => {
              console.error('Error al cargar valores:', error);
            }
          });
        }

        onUpdateMision(contenido: string): void {
            this.isLoadingMision = true;
            if (this.mision && this.mision.id) {
                // Si existe, actualizar
                this.whoWeAreService.updateMision(this.mision.id, contenido).subscribe({
                  next: (data) => {
                    this.mision = data;
                    this.isLoadingMision = false;
                    alert('Misión actualizada correctamente');
                  },
                  error: (error) => {
                    console.error('Error al actualizar misión:', error);
                    this.isLoadingMision = false;
                    alert('Error al actualizar misión');
                  }
                });
              } else {
                // Si no existe, crear
                this.whoWeAreService.createMision(contenido).subscribe({
                  next: (data) => {
                    this.mision = data;
                    this.isLoadingMision = false;
                    alert('Misión creada correctamente');
                  },
                  error: (error) => {
                    console.error('Error al crear misión:', error);
                    this.isLoadingMision = false;
                    alert('Error al crear misión');
                  }
                });
              }
          }

          onUpdateVision(contenido: string): void {
            this.isLoadingVision = true;
            if (this.vision && this.vision.id) {
              // Si existe, actualizar
              this.whoWeAreService.updateVision(this.vision.id, contenido).subscribe({
                next: (data) => {
                  this.vision = data;
                  this.isLoadingVision = false;
                  alert('Visión actualizada correctamente');
                },
                error: (error) => {
                  console.error('Error al actualizar visión:', error);
                  this.isLoadingVision = false;
                  alert('Error al actualizar visión');
                }
              });
            } else {
              // Si no existe, crear
              this.whoWeAreService.createVision(contenido).subscribe({
                next: (data) => {
                  this.vision = data;
                  this.isLoadingVision = false;
                  alert('Visión creada correctamente');
                },
                error: (error) => {
                  console.error('Error al crear visión:', error);
                  this.isLoadingVision = false;
                  alert('Error al crear visión');
                }
              });
            }
          }
        
          onUpdateHistoria(contenido: string): void {
            this.isLoadingHistoria = true;
            if (this.historia && this.historia.id) {
              // Si existe, actualizar
              this.whoWeAreService.updateHistoria(this.historia.id, contenido).subscribe({
                next: (data) => {
                  this.historia = data;
                  this.isLoadingHistoria = false;
                  alert('Historia actualizada correctamente');
                },
                error: (error) => {
                  console.error('Error al actualizar historia:', error);
                  this.isLoadingHistoria = false;
                  alert('Error al actualizar historia');
                }
              });
            } else {
              // Si no existe, crear
              this.whoWeAreService.createHistoria(contenido).subscribe({
                next: (data) => {
                  this.historia = data;
                  this.isLoadingHistoria = false;
                  alert('Historia creada correctamente');
                },
                error: (error) => {
                  console.error('Error al crear historia:', error);
                  this.isLoadingHistoria = false;
                  alert('Error al crear historia');
                }
              });
            }
          }
        

          onObjetivoAdded(item: { titulo: string; contenido: string }): void {
            this.isLoadingObjetivos = true;
            this.whoWeAreService.createObjetivo(item.titulo, item.contenido).subscribe({
              next: (data) => {
                this.objetivos.push(data);
                this.isLoadingObjetivos = false;
                this.loadData();
                alert('Objetivo creado correctamente');
              },
              error: (error) => {
                console.error('Error al crear objetivo:', error);
                this.isLoadingObjetivos = false;
                alert('Error al crear objetivo');
              }
            });
          }

          onObjetivoUpdated(item: { id: number; titulo: string; contenido: string }): void {
            this.isLoadingObjetivos = true;
            this.whoWeAreService.updateObjetivo(item.id, item.titulo, item.contenido).subscribe({
              next: (data) => {
                const index = this.objetivos.findIndex(obj => obj.id === data.id);
                if (index !== -1) {
                  this.objetivos[index] = data;
                }
                this.isLoadingObjetivos = false;
                alert('Objetivo actualizado correctamente');
              },
              error: (error) => {
                console.error('Error al actualizar objetivo:', error);
                this.isLoadingObjetivos = false;
                alert('Error al actualizar objetivo');
              }
            });
          }

          onObjetivoDeleted(id: number): void {
            this.isLoadingObjetivos = true;
            this.whoWeAreService.deleteObjetivo(id).subscribe({
              next: () => {
                this.objetivos = this.objetivos.filter(obj => obj.id !== id);
                this.isLoadingObjetivos = false;
                alert('Objetivo eliminado correctamente');
              },
              error: (error) => {
                console.error('Error al eliminar objetivo:', error);
                this.isLoadingObjetivos = false;
                alert('Error al eliminar objetivo');
              }
            });
          }
        
          onValorAdded(item: { titulo: string; contenido: string }): void {
            this.isLoadingValores = true;
            this.whoWeAreService.createValor(item.titulo, item.contenido).subscribe({
              next: (data) => {
                this.valores.push(data);
                this.isLoadingValores = false;
                this.loadData();
                alert('Valor creado correctamente');
              },
              error: (error) => {
                console.error('Error al crear valor:', error);
                this.isLoadingValores = false;
                alert('Error al crear valor');
              }
            });
          }
          onValorUpdated(item: { id: number; titulo: string; contenido: string }): void {
            this.isLoadingValores = true;
            this.whoWeAreService.updateValor(item.id, item.titulo, item.contenido).subscribe({
              next: (data) => {
                const index = this.valores.findIndex(val => val.id === data.id);
                if (index !== -1) {
                  this.valores[index] = data;
                }
                this.isLoadingValores = false;
                alert('Valor actualizado correctamente');
              },
              error: (error) => {
                console.error('Error al actualizar valor:', error);
                this.isLoadingValores = false;
                alert('Error al actualizar valor');
              }
            });
          }
          onValorDeleted(id: number): void {
            this.isLoadingValores = true;
            this.whoWeAreService.deleteValor(id).subscribe({
              next: () => {
                this.valores = this.valores.filter(val => val.id !== id);
                this.isLoadingValores = false;
                alert('Valor eliminado correctamente');
              },
              error: (error) => {
                console.error('Error al eliminar valor:', error);
                this.isLoadingValores = false;
                alert('Error al eliminar valor');
              }
            });
          }

          get objetivosAsItemData(): ItemData[] {
            return this.objetivos.map(obj => ({
              id: obj.id,
              titulo: obj.titulo,
              contenido: obj.contenido
            }));
          }

          get valoresAsItemData(): ItemData[] {
            return this.valores.map(val => ({
              id: val.id,
              titulo: val.titulo,
              contenido: val.contenido
            }));
          }

          onCancel(): void {
            // No action needed - forms are always visible in edit mode
          }

          goBack(): void {
            this.router.navigate(['/user']);
          }

          viewWhoWeAre(): void {
            this.router.navigate(['/who-we-are']);
          }
        }

