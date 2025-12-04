from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from apps.informacion.permissions import verificarToken
from apps.informacion.Models.Productividad import Mision, Vision, Objetivo, Historia, Valor
from apps.informacion.Serializers.ProductividadSerializer import (
    MisionSerializer, VisionSerializer, ObjetivoSerializer, HistoriaSerializer, ValorSerializer
)

from django.shortcuts import get_object_or_404


# ======================================================
#   MISIÓN
# ======================================================
class MisionViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'], url_path='listar')
    def listar(self, request):
        mision = Mision.objects.first()
        if not mision:
            return Response({"message": "No se ha registrado la misión."}, status=200)

        return Response(MisionSerializer(mision).data, status=200)

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        # Evitar más de un registro
        if Mision.objects.exists():
            return Response(
                {"error": "Ya existe una misión registrada. Solo puede haber una."},
                status=400
            )

        serializer = MisionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['put'], url_path='editar')
    def editar(self, request, pk=None):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        mision = get_object_or_404(Mision, pk=pk)
        serializer = MisionSerializer(mision, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    # ======================
    #   VER MISIÓN (PUBLICO)
    # ======================
    @action(detail=False, methods=['get'], url_path='ver')
    def ver(self, request):
        mision = Mision.objects.first()
        if not mision:
            return Response({"message": "No hay misión registrada."}, status=200)
        return Response(MisionSerializer(mision).data, status=200)



# ======================================================
#   VISIÓN
# ======================================================
class VisionViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['get'], url_path='listar')
    def listar(self, request):
        vision = Vision.objects.first()
        if not vision:
            return Response({"message": "No se ha registrado la visión."}, status=200)

        return Response(VisionSerializer(vision).data)

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        if Vision.objects.exists():
            return Response(
                {"error": "Ya existe una visión. Solo puede haber una."},
                status=400
            )

        serializer = VisionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['put'], url_path='editar')
    def editar(self, request, pk=None):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        vision = get_object_or_404(Vision, pk=pk)
        serializer = VisionSerializer(vision, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    

    # ======================
    #   VER VISIÓN (PUBLICO)
    # ======================
    @action(detail=False, methods=['get'], url_path='ver')
    def ver(self, request):
        vision = Vision.objects.first()
        if not vision:
            return Response({"message": "No hay visión registrada."}, status=200)
        return Response(VisionSerializer(vision).data, status=200)




# ======================================================
#   HISTORIA
# ======================================================
class HistoriaViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['get'], url_path='listar')
    def listar(self, request):
        historia = Historia.objects.first()
        if not historia:
            return Response({"message": "No se ha registrado la historia."}, status=200)

        return Response(HistoriaSerializer(historia).data)

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        if Historia.objects.exists():
            return Response(
                {"error": "Ya existe una historia registrada. Solo puede haber una."},
                status=400
            )

        serializer = HistoriaSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['put'], url_path='editar')
    def editar(self, request, pk=None):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        historia = get_object_or_404(Historia, pk=pk)
        serializer = HistoriaSerializer(historia, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    # ======================
    #   VER HISTORIA (PUBLICO)
    # ======================
    @action(detail=False, methods=['get'], url_path='ver')
    def ver(self, request):
        historia = Historia.objects.first()
        if not historia:
            return Response({"message": "No hay historia registrada."}, status=200)
        return Response(HistoriaSerializer(historia).data, status=200)


# ======================================================
#   OBJETIVOS
# ======================================================
class ObjetivoViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        serializer = ObjetivoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'], url_path='listar')
    def listar(self, request):
        objetivos = Objetivo.objects.all().order_by('-actualizado_en')
        return Response(ObjetivoSerializer(objetivos, many=True).data)

    @action(detail=True, methods=['put'], url_path='editar')
    def editar(self, request, pk=None):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        instance = get_object_or_404(Objetivo, pk=pk)
        serializer = ObjetivoSerializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], url_path='eliminar')
    def eliminar(self, request, pk=None):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        instance = get_object_or_404(Objetivo, pk=pk)
        instance.delete()
        return Response({'message': 'Objetivo eliminado correctamente'}, status=200)
    
    # ======================
    #   VER OBJETIVOS (PUBLICO)
    # ======================
    @action(detail=False, methods=['get'], url_path='ver')
    def ver(self, request):
        objetivos = Objetivo.objects.all().order_by('-actualizado_en')
        return Response(ObjetivoSerializer(objetivos, many=True).data, status=200)


# ======================================================
#   VALORES
# ======================================================
class ValorViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        serializer = ValorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'], url_path='listar')
    def listar(self, request):
        valores = Valor.objects.all().order_by('-actualizado_en')
        return Response(ValorSerializer(valores, many=True).data)

    @action(detail=True, methods=['put'], url_path='editar')
    def editar(self, request, pk=None):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        instance = get_object_or_404(Valor, pk=pk)
        serializer = ValorSerializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'], url_path='eliminar')
    def eliminar(self, request, pk=None):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        instance = get_object_or_404(Valor, pk=pk)
        instance.delete()
        return Response({'message': 'Valor eliminado correctamente'}, status=200)
    
    # ======================
    #   VER VALORES (PUBLICO)
    # ======================
    @action(detail=False, methods=['get'], url_path='ver')
    def ver(self, request):
        valores = Valor.objects.all().order_by('-actualizado_en')
        return Response(ValorSerializer(valores, many=True).data, status=200)

