import requests
import jwt
from jwt.algorithms import RSAAlgorithm
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
FIREBASE_PROJECT_ID = "iotic-844db"

@api_view(['GET'])
def auth_me(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response({'detail': 'Missing Bearer token'}, status=status.HTTP_401_UNAUTHORIZED)

    id_token = auth_header.split(' ', 1)[1]

    try:
        #Obtener las claves públicas de Google
        res = requests.get(GOOGLE_CERTS_URL)
        certs = res.json()

        #Decodificar el encabezado del token para saber cuál clave usar
        unverified_header = jwt.get_unverified_header(id_token)
        key_id = unverified_header['kid']
        public_key = RSAAlgorithm.from_jwk(jwt.PyJWKClient(GOOGLE_CERTS_URL).get_signing_key_from_jwt(id_token).key)

        #Verificar el token
        decoded = jwt.decode(
            id_token,
            key=public_key,
            algorithms=['RS256'],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
        )

        return Response({'uid': decoded.get('user_id'), 'claims': decoded}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'detail': 'Invalid token', 'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
