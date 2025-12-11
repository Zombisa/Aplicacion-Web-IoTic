from rest_framework import serializers
from django.utils import timezone
from .models import Inventario, Prestamo

class InventarioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Inventario.
    
    Maneja la validación de datos de entrada y serialización de respuestas.
    Valida que:
    - descripción no esté vacía
    - estado_fisico sea uno de los valores válidos (Excelente, Bueno, Dañado)
    - estado_admin sea uno de los valores válidos (Disponible, Prestado, No prestar)
    
    Campos read-only: id, serial (autogenerado), fecha_registro
    """
    class Meta:
        model = Inventario
        fields = [
            'id', 'serial', 'descripcion',
            'estado_fisico', 'estado_admin',
            'fecha_registro','observacion',
            'image_r2'
        ]
        read_only_fields = ['id', 'serial', 'fecha_registro']
    
    def validate_descripcion(self, value):
        """
        Validar que descripción no esté vacía o solo contenga espacios.
        
        Args:
            value (str): Descripción del ítem
            
        Returns:
            str: Descripción sin espacios al inicio/final
            
        Raises:
            ValidationError: Si la descripción está vacía
        """
        if not value or not value.strip():
            raise serializers.ValidationError("La descripción no puede estar vacía.")
        return value.strip()
    
    def validate_estado_fisico(self, value):
        """
        Validar que estado_fisico sea uno de los valores permitidos.
        
        Args:
            value (str): Estado físico del ítem
            
        Returns:
            str: El valor validado
            
        Raises:
            ValidationError: Si el valor no está en la lista de opciones válidas
        """
        valid_choices = ['Excelente', 'Bueno', 'Dañado']
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"estado_fisico debe ser uno de: {valid_choices}"
            )
        return value
    
    def validate_estado_admin(self, value):
        """
        Validar que estado_admin sea uno de los valores permitidos.
        
        Args:
            value (str): Estado administrativo del ítem
            
        Returns:
            str: El valor validado
            
        Raises:
            ValidationError: Si el valor no está en la lista de opciones válidas
        """
        valid_choices = ['Disponible', 'Prestado', 'No prestar']
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"estado_admin debe ser uno de: {valid_choices}"
            )
        return value


class PrestamoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Prestamo.
    
    Maneja validación robusta de datos del prestatario y fechas.
    
    Validaciones de campos:
    - nombre_persona: No vacío, máx 100 caracteres
    - cedula: No vacía, debe contener al menos un dígito
    - telefono: No vacío, mín 7 caracteres, debe contener dígitos
    - correo: Formato email válido (contiene @ y .)
    - direccion: No vacía, máx 200 caracteres
    - fecha_limite: Debe ser posterior a la fecha actual
    
    Campos read-only: id, fecha_prestamo, fecha_devolucion, estado, item (anidado)
    
    Nota: item_id se usa para escribir (crear préstamo)
    El campo 'item' en la respuesta contiene la información snapshot del momento del préstamo
    """
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventario.objects.all(),
        source='item',
        write_only=True
    )

    class Meta:
        model = Prestamo
        fields = [
            'id',
            'nombre_persona', 
            'cedula', 
            'telefono', 
            'correo', 
            'direccion',
            'fecha_prestamo', 
            'fecha_devolucion',
            'fecha_limite',
            'estado',
            'item_id',
            'item'
        ]
        read_only_fields = ['id', 'fecha_prestamo', 'fecha_devolucion', 'estado', 'item']
    
    def to_representation(self, instance):
        """
        Customiza la salida para mostrar la información snapshot del item
        tal como estaba en el momento del préstamo.
        """
        representation = super().to_representation(instance)
        
        # Crear objeto item con la información snapshot del momento del préstamo
        representation['item'] = {
            'id': instance.item.id,
            'serial': instance.item_serial_snapshot or instance.item.serial,
            'descripcion': instance.item_descripcion_snapshot or instance.item.descripcion,
            'estado_fisico': instance.item_estado_fisico_snapshot or instance.item.estado_fisico,
            'estado_admin': instance.item_estado_admin_snapshot or instance.item.estado_admin,
            'fecha_registro': instance.item.fecha_registro,
            'observacion': instance.item_observacion_snapshot if instance.item_observacion_snapshot is not None else instance.item.observacion,
            'image_r2': instance.item_image_r2_snapshot if instance.item_image_r2_snapshot is not None else instance.item.image_r2
        }
        
        return representation
    
    def validate_nombre_persona(self, value):
        """
        Validar que nombre_persona no esté vacío.
        
        Args:
            value (str): Nombre del prestatario
            
        Returns:
            str: Nombre sin espacios al inicio/final
            
        Raises:
            ValidationError: Si el nombre está vacío
        """
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre de la persona no puede estar vacío.")
        return value.strip()
    
    def validate_cedula(self, value):
        """
        Validar que cédula no esté vacía y contenga al menos un dígito.
        
        Args:
            value (str): Número de cédula/identificación
            
        Returns:
            str: Cédula sin espacios al inicio/final
            
        Raises:
            ValidationError: Si está vacía o no contiene dígitos
        """
        if not value or not value.strip():
            raise serializers.ValidationError("La cédula no puede estar vacía.")
        cedula_clean = value.strip()
        if not any(char.isdigit() for char in cedula_clean):
            raise serializers.ValidationError("La cédula debe contener al menos un dígito.")
        return cedula_clean
    
    def validate_telefono(self, value):
        """
        Validar que teléfono tenga mínimo 7 caracteres y contenga dígitos.
        
        Args:
            value (str): Número de teléfono
            
        Returns:
            str: Teléfono sin espacios al inicio/final
            
        Raises:
            ValidationError: Si está vacío, tiene menos de 7 caracteres o sin dígitos
        """
        if not value or not value.strip():
            raise serializers.ValidationError("El teléfono no puede estar vacío.")
        telefono_clean = value.strip()
        if len(telefono_clean) < 7:
            raise serializers.ValidationError("El teléfono debe tener al menos 7 caracteres.")
        if not any(char.isdigit() for char in telefono_clean):
            raise serializers.ValidationError("El teléfono debe contener al menos un dígito.")
        return telefono_clean
    
    def validate_correo(self, value):
        """
        Validar que correo tenga formato email válido (contiene @ y .).
        
        Args:
            value (str): Dirección de correo electrónico
            
        Returns:
            str: Email en minúsculas sin espacios
            
        Raises:
            ValidationError: Si está vacío o no tiene formato válido
        """
        if not value or not value.strip():
            raise serializers.ValidationError("El correo no puede estar vacío.")
        value_clean = value.strip().lower()
        if '@' not in value_clean or '.' not in value_clean:
            raise serializers.ValidationError("El correo debe tener un formato válido (ej: usuario@dominio.com).")
        return value_clean
    
    def validate_direccion(self, value):
        """
        Validar que dirección no esté vacía.
        
        Args:
            value (str): Dirección del prestatario
            
        Returns:
            str: Dirección sin espacios al inicio/final
            
        Raises:
            ValidationError: Si está vacía
        """
        if not value or not value.strip():
            raise serializers.ValidationError("La dirección no puede estar vacía.")
        return value.strip()
    
    def validate_fecha_limite(self, value):
        """
        Validar que fecha_limite sea posterior a la fecha actual.
        
        Args:
            value (datetime): Fecha límite de devolución
            
        Returns:
            datetime: La fecha validada
            
        Raises:
            ValidationError: Si la fecha no es futura
        """
        if value <= timezone.now():
            raise serializers.ValidationError("La fecha límite debe ser posterior a la fecha actual.")
        return value
    
    def validate(self, data):
        """
        Validar lógica entre campos (validaciones cruzadas).
        
        Actualmente valida que fecha_limite sea posterior a la fecha actual.
        
        Args:
            data (dict): Datos del préstamo
            
        Returns:
            dict: Datos validados
            
        Raises:
            ValidationError: Si hay inconsistencias entre campos
        """
        if 'fecha_limite' in data:
            if data['fecha_limite'] <= timezone.now():
                raise serializers.ValidationError(
                    'La fecha límite debe ser posterior a la fecha actual.'
                )
        return data