import { Component, Input, OnInit } from '@angular/core';
import { LoanService } from '../../../../services/Loan.service';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../../../services/inventory.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';

@Component({
  selector: 'app-view-item',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-item.html',
  styleUrl: './view-item.css'
})
export class ViewItem implements OnInit {

  private itemId!: number;  
  public item?: ItemDTO;
  constructor(
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}
  /**
   * Inicialización del componente
   * Obtiene el id de la url
   */
  ngOnInit(): void {
    
    this.activatedRoute.paramMap.subscribe(params => {
      this.itemId = Number(params.get('id'));
      console.log('ID del item obtenido de la URL:', this.itemId);
      this.getItemById();
    });
  }

  /**
   * Obtener el item por ID
   * @Returns void no retorna el item pero si lo guarda dentro de la variable del componente
   */
  getItemById(): void {
    this.loadingService.show();
    console.log('Obteniendo el item con ID:', this.itemId);
    this.inventoryService.getElectronicComponentById(this.itemId).subscribe({
      next: (item) => {
        this.item = item;
        console.log('Item obtenido:', this.item);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el item:', error);
      }
    })  
    
  };
  /**
   * Navegar a la página de edición del item
   */
  goToEdit(): void{
    console.log('Navegando a la página de edición del item con ID:', this.itemId);
    this.router.navigate(['/edit-item', this.itemId]);
  }
  goToLoan(): void{
    console.log('Navegando a la página de edición del item con ID:', this.itemId);
    this.router.navigate(['inventario/add-loan', this.itemId]);
  }
}
