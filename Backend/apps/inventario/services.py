from .models import Inventario, Prestamo
from rest_framework.exceptions import ValidationError

class PrestamoService:

    @staticmethod
    def validar_prestamo(inventario: Inventario):
        if inventario.cantidad_disponible <= 0:
            raise ValidationError("No hay unidades disponibles para préstamo.")

    @staticmethod
    def registrar_prestamo(data):
        inventario = data["item"]

        PrestamoService.validar_prestamo(inventario)

        prestamo = Prestamo.objects.create(**data)

        inventario.cantidad_prestada += 1
        inventario.cantidad_disponible = inventario.cantidad_total - inventario.cantidad_prestada
        inventario.save()

        return prestamo

    @staticmethod
    def registrar_devolucion(prestamo: Prestamo, nuevo_estado: str):
        inventario = prestamo.item

        if prestamo.estado == "devuelto":
            raise ValidationError("Este préstamo ya fue devuelto.")

        prestamo.estado = nuevo_estado
        prestamo.save()

        inventario.cantidad_prestada -= 1
        inventario.cantidad_disponible = inventario.cantidad_total - inventario.cantidad_prestada
        inventario.save()

        return prestamo
