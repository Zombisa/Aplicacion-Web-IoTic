import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import emailjs from 'emailjs-com';
import { Header } from '../../templates/header/header';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  email: string = '';
  message: string = '';
  successMessage: string = '';
  name: string = '';

  public mensajeInvitacion: string = 'En Help IoTic valoramos profundamente la opinión de nuestros usuarios. Si tienes alguna experiencia que desees compartir, sugerencias para mejorar nuestros servicios, o simplemente quieres hacernos llegar tus comentarios, por favor utiliza el siguiente formulario. Tu aporte es fundamental para seguir creciendo y ofrecerte siempre la mejor atención.'
sendEmail() {
  emailjs.send(
    'iotic',                // Tu Service ID
    'template_7eyusmi',     // Tu Template ID
    {
      name: this.name,      // Coincide con {{name}}
      title: this.message,  // Coincide con {{title}}
      email: this.email     // Coincide con {{email}} en “To Email”
    },
    '-qqk3WNKcqt39owTL'     // Tu Public Key
  ).then(() => {
    this.successMessage = '¡Mensaje enviado!';
    this.email = '';
    this.message = '';
    this.name = '';
  }, () => {
    this.successMessage = 'Error al enviar el mensaje.';
  });
}

}
