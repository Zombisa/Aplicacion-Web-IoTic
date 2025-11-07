import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { InventoryService } from '../../../../services/inventory.service';
import { InventoryTable } from '../../components/inventory-table/inventory-table';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, Header, InventoryTable, RouterModule],
  templateUrl: './inventory-page.component.html',
  styleUrls: ['./inventory-page.component.css']
})
export class InventoryPageComponent implements OnInit {

  public messageWelcome: string = "Bienvenido al inventario de IoTic";
  public resume = {
    total_items: 0,
    disponibles: 0,
    prestados: 0,
    dados_De_Baja: 0
  };
  public options = [
    {
      key: 'agregar',
      title: 'Agreguemos un nuevo item',
      description: 'En esta seccion podras agregar un nuevo item al inventario.',
      route: 'add-item'
    },
    {
      key: 'prestamo',
      title: 'Añadammos un prestamo',
      description: 'En esta seccion podras pedir un prestamo.',
      route: 'add-loan'
    },
  ];
  public inventoryData: ItemDTO[] = [];

  constructor(private inventoryService: InventoryService) { }
  ngOnInit(): void {
    this.loadInventoryData();
  }
  loadInventoryData() {
  console.log('Cargando datos del inventario desde el componente.');
  this.inventoryService.getElectronicComponent().subscribe({
    next: (data: ItemDTO[]) => {
      this.inventoryData = data;
      this.updateResume();
    },
    error: (err) => {
      console.error('Error al cargar los datos del inventario:', err);
    }
  });
}
 updateResume() {
  // Total de ítems en el inventario
  this.resume.total_items = this.inventoryData.length;

  // Contadores según estado
  this.resume.disponibles = this.inventoryData.filter(
    item => item.estadoAdministrativo.toLowerCase() === 'disponible'
  ).length;

  this.resume.prestados = this.inventoryData.filter(
    item => item.estadoAdministrativo.toLowerCase() === 'prestado'
  ).length;

  this.resume.dados_De_Baja = this.inventoryData.filter(
    item => item.estadoAdministrativo.toLowerCase() === 'dado de baja' ||
            item.estadoAdministrativo.toLowerCase() === 'dañado'
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
}