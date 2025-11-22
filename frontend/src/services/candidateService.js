import axios from 'axios';

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('http://localhost:3010/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Devuelve la ruta del archivo y el tipo
    } catch (error) {
        const errorMessage = error.response?.data 
            ? `Error al subir el archivo: ${error.response.data}` 
            : `Error al subir el archivo: ${error.message || 'Error desconocido'}`;
        throw new Error(errorMessage);
    }
};

export const sendCandidateData = async (candidateData) => {
    try {
        const response = await axios.post('http://localhost:3010/candidates', candidateData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data 
            ? `Error al enviar datos del candidato: ${error.response.data}` 
            : `Error al enviar datos del candidato: ${error.message || 'Error desconocido'}`;
        throw new Error(errorMessage);
    }
};