import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { FormRegistroFotografico } from '../../templates/form-registro-fotografico/form-registro-fotografico';
import { LoadingPage } from '../../components/loading-page/loading-page';

@Component({
  selector: 'app-add-registro-fotografico',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    FormRegistroFotografico,
    LoadingPage
  ],
  templateUrl: './add-registro-fotografico.html',
  styleUrls: ['./add-registro-fotografico.css']
})
export class AddRegistroFotograficoPage implements OnInit {

  modo: 'create' | 'edit' = 'create';
  id: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = param ? Number(param) : null;

    this.modo = this.id ? 'edit' : 'create';
  }

  onSaved(): void {
    this.router.navigate(['/admin/registro-fotografico']);
  }

  onCancel(): void {
    this.router.navigate(['/admin/registro-fotografico']);
  }
}
