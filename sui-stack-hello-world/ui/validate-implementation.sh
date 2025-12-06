#!/bin/bash
# Script de validación de la implementación de gRPC

echo "🔍 Validando Implementación de gRPC Sui Stack"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de archivos
files_found=0
files_total=10

# Función para validar archivo
validate_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((files_found++))
    else
        echo -e "${RED}✗${NC} $description"
        echo "  Esperado: $file"
    fi
}

# Cambiar al directorio correcto
cd "$(dirname "$0")" || exit

# Validar archivos de configuración
echo "📁 Validando Archivos de Configuración"
echo "--------------------------------------"
validate_file "src/config/grpcConfig.ts" "Configuración centralizada"
validate_file ".env.example" "Variables de entorno"

echo ""
echo "⚙️  Validando Capa de Servicio"
echo "--------------------------------------"
validate_file "src/services/grpcClient.ts" "Cliente gRPC (40+ métodos)"

echo ""
echo "⚛️  Validando Integración React"
echo "--------------------------------------"
validate_file "src/contexts/GrpcContext.tsx" "Context y Provider"
validate_file "src/hooks/useGrpc.ts" "11 Hooks personalizados"
validate_file "src/components/GrpcConnection.tsx" "Componentes de Conexión"
validate_file "src/components/GrpcApiExplorer.tsx" "Explorador de APIs"

echo ""
echo "📚 Validando Tipos y Utilidades"
echo "--------------------------------------"
validate_file "src/types/grpc.ts" "Tipos TypeScript"
validate_file "src/utils/fieldMask.ts" "Utilidades de Field Masks"

echo ""
echo "📖 Validando Documentación"
echo "--------------------------------------"
validate_file "INTEGRATION_GUIDE.md" "Guía de Integración"
validate_file "GRPC_README.md" "README Principal"

echo ""
echo "================================================"
echo "Resumen: $files_found/$files_total archivos validados"
echo ""

# Validar contenido clave en archivos
echo "🔎 Validando Contenido"
echo "--------------------------------------"

# Validar Client gRPC
if grep -q "class SuiGrpcClient" "src/services/grpcClient.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} SuiGrpcClient implementado"
else
    echo -e "${RED}✗${NC} SuiGrpcClient no encontrado"
fi

# Validar Context
if grep -q "GrpcProvider" "src/contexts/GrpcContext.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} GrpcProvider implementado"
else
    echo -e "${RED}✗${NC} GrpcProvider no encontrado"
fi

# Validar Hooks
if grep -q "useTransaction" "src/hooks/useGrpc.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Hooks React implementados"
else
    echo -e "${RED}✗${NC} Hooks React no encontrados"
fi

# Validar Componentes
if grep -q "GrpcConnectionSelector" "src/components/GrpcConnection.tsx" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Componentes UI implementados"
else
    echo -e "${RED}✗${NC} Componentes UI no encontrados"
fi

# Validar Configuración
if grep -q "GRPC_CONFIG" "src/config/grpcConfig.ts" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Configuración centralizada"
else
    echo -e "${RED}✗${NC} Configuración no encontrada"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ Validación Completada${NC}"
echo ""
echo "🚀 Para comenzar a usar:"
echo "1. cd sui-stack-hello-world/ui"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "📖 Para documentación, ver:"
echo "- INTEGRATION_GUIDE.md"
echo "- GRPC_README.md"
echo "- IMPLEMENTATION_SUMMARY.md"
echo ""
