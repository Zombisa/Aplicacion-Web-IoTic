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

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        serializer = MisionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['put'], url_path='editar')
    def editar(self, request, pk=None):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        instance = get_object_or_404(Mision, pk=pk)
        serializer = MisionSerializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)



# ======================================================
#   VISIÓN
# ======================================================
class VisionViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        serializer = VisionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['put'], url_path='editar')
    def editar(self, request, pk=None):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        instance = get_object_or_404(Vision, pk=pk)
        serializer = VisionSerializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


# ======================================================
#   HISTORIA
# ======================================================
class HistoriaViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        serializer = HistoriaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['put'], url_path='editar')
    def editar(self, request, pk=None):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        instance = get_object_or_404(Historia, pk=pk)
        serializer = HistoriaSerializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

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
