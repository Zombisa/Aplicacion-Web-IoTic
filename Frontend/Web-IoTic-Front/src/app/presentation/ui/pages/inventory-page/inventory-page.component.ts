import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { InventoryService } from '../../../../services/inventory.service';
import { InventoryTable } from '../../components/inventory-table/inventory-table';
import { Route, RouterLink, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';


@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, Header, InventoryTable, RouterModule, LoadingPage],
  templateUrl: './inventory-page.component.html',
  styleUrls: ['./inventory-page.component.css']
})
export class InventoryPageComponent implements OnInit {

  public messageWelcome: string = "Bienvenido al inventario de IoTic";
  public resume = {
    total_items: 0,
    disponibles: 0,
    prestados: 0,
    dañados: 0
  };
  public options = [
    {
      key: 'agregar',
      title: 'Agreguemos un nuevo item',
      description: 'En esta seccion podras agregar un nuevo item al inventario.',
      route: 'add-item'
    },
    {
      key: 'listar_prestamos',
      title: 'Ver prestamos vigentes',
      description: 'En esta seccion podras listar los prestamos vigentess.',
      route: 'view-item/1'
    },
  ];
  public inventoryData: ItemDTO[] = [];

  constructor(private inventoryService: InventoryService,
    public loadingService: LoadingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInventoryData();
  }
  /**
   * Carga los datos del inventario desde el servicio y actualiza el resumen.
   */
  loadInventoryData() {
    this.loadingService.show();
    console.log('Cargando datos del inventario desde el componente.');
    this.inventoryService.getElectronicComponent().subscribe({
      next: (data: ItemDTO[]) => {
        this.inventoryData = data;
        this.updateResume();
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error al cargar los datos del inventario:', err);
      }
    });
  }
  /**
   * Actualiza el resumen del inventario basado en los datos cargados.
   */
 updateResume() {
  // Total de ítems en el inventario
  this.resume.total_items = this.inventoryData.length;

  // Contadores según estado
  this.resume.disponibles = this.inventoryData.filter(
    item => item.estado_admin.toLowerCase() === 'disponible'
  ).length;

  this.resume.prestados = this.inventoryData.filter(
    item => item.estado_admin.toLowerCase() === 'prestado'
  ).length;

  this.resume.dañados = this.inventoryData.filter(
    item => item.estado_admin === 'Dañado'
  ).length;
}

  /**
   * Obtiene un array de entradas del objeto resume para facilitar su iteración en la plantilla.
   */
 get resumeArray() {
    return Object.entries(this.resume).map(([key, value]) => {
      // Reemplazar guiones bajos por espacios y capitalizar cada palabra
      const formattedKey = key
        .replace(/_/g, ' ')              // "total_products" -> "total products"
        .replace(/\b\w/g, c => c.toUpperCase()); // "total products" -> "Total Products"

      return { key: formattedKey, value };
    });
  }
  /**
   * Navegando al item seleccionado
   */
  onItemSelected(itemId: number) {
    console.log("Navegando al item con ID:", itemId);
    this.router.navigate(['/inventario/view-item', itemId ]);
  }
}