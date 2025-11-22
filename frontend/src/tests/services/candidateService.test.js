import axios from 'axios';
import { uploadCV, sendCandidateData } from '../../services/candidateService';

jest.mock('axios');

describe('Candidate Service (Frontend)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadCV', () => {
    describe('Happy Path', () => {
      test('debe_subir_cv_exitosamente', async () => {
        // Arrange
        const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const mockResponse = {
          data: {
            filePath: '/path/to/file.pdf',
            fileType: 'application/pdf'
          }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        const result = await uploadCV(mockFile);

        // Assert
        expect(result).toEqual(mockResponse.data); // 'El resultado debería contener filePath y fileType'
        expect(axios.post).toHaveBeenCalledTimes(1); // 'Debería llamar a axios.post'
        expect(axios.post).toHaveBeenCalledWith( // 'Debería llamar con la URL correcta'
          'http://localhost:3010/upload',
          expect.any(FormData),
          expect.objectContaining({
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        );
      });

      test('debe_crear_FormData_correctamente', async () => {
        // Arrange
        const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const mockResponse = {
          data: {
            filePath: '/path/to/file.pdf',
            fileType: 'application/pdf'
          }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        await uploadCV(mockFile);

        // Assert
        const formDataCall = axios.post.mock.calls[0][1];
        expect(formDataCall).toBeInstanceOf(FormData); // 'Debería ser una instancia de FormData'
      });

      test('debe_retornar_datos_del_archivo', async () => {
        // Arrange
        const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const mockResponse = {
          data: {
            filePath: '/uploads/test.pdf',
            fileType: 'application/pdf'
          }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        const result = await uploadCV(mockFile);

        // Assert
        expect(result.filePath).toBe('/uploads/test.pdf'); // 'El filePath debería estar correcto'
        expect(result.fileType).toBe('application/pdf'); // 'El fileType debería estar correcto'
      });

      test('debe_configurar_headers_correctamente', async () => {
        // Arrange
        const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const mockResponse = {
          data: {
            filePath: '/path/to/file.pdf',
            fileType: 'application/pdf'
          }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        await uploadCV(mockFile);

        // Assert
        expect(axios.post).toHaveBeenCalledWith( // 'Debería configurar headers con Content-Type multipart/form-data'
          expect.any(String),
          expect.any(FormData),
          expect.objectContaining({
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        );
      });
    });

    describe('Alternative Path', () => {
      test('debe_lanzar_error_si_subida_falla', async () => {
        // Arrange
        const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const error = new Error('Network error');
        axios.post.mockRejectedValue(error);

        // Act & Assert
        await expect(
          uploadCV(mockFile)
          ).rejects.toThrow('Error al subir el archivo:'); // 'Debería lanzar error si la subida falla'        
      });

      test('debe_lanzar_error_con_mensaje_descriptivo', async () => {
        // Arrange
        const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const axiosError = {
          response: {
            data: { error: 'File too large' }
          }
        };
        axios.post.mockRejectedValue(axiosError);

        // Act & Assert
        await expect(
          uploadCV(mockFile)
          ).rejects.toThrow('Error al subir el archivo:'); // 'Debería lanzar error con mensaje descriptivo'
      });
    });

    describe('Casos Límite', () => {
      test('debe_manejar_archivo_vacio', async () => {
        // Arrange
        const mockFile = new File([], 'empty.pdf', { type: 'application/pdf' });
        const mockResponse = {
          data: {
            filePath: '/path/to/empty.pdf',
            fileType: 'application/pdf'
          }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        const result = await uploadCV(mockFile);

        // Assert
        expect(result).toBeDefined(); // 'Debería manejar archivo vacío correctamente'
      });

      test('debe_manejar_error_sin_response', async () => {
        // Arrange
        const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const error = new Error('Network error');
        error.response = undefined;
        axios.post.mockRejectedValue(error);

        // Act & Assert
        await expect(
          uploadCV(mockFile)
          ).rejects.toThrow('Error al subir el archivo:'); // 'Debería manejar error sin response'
      });
    });
  });

  describe('sendCandidateData', () => {
    describe('Happy Path', () => {
      test('debe_enviar_datos_exitosamente', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com'
        };
        const mockResponse = {
          data: { id: 1, ...candidateData }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        const result = await sendCandidateData(candidateData);

        // Assert
        expect(result).toEqual(mockResponse.data); // 'El resultado debería ser la respuesta del servidor'
        expect(axios.post).toHaveBeenCalledTimes(1); // 'Debería llamar a axios.post'
        expect(axios.post).toHaveBeenCalledWith( // 'Debería llamar con la URL correcta'
          'http://localhost:3010/candidates',
          candidateData
        );
      });

      test('debe_enviar_datos_completos', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '612345678',
          address: 'Calle Principal 123',
          educations: [{
            institution: 'Universidad Test',
            title: 'Ingeniería',
            startDate: '2020-01-01',
            endDate: '2024-01-01'
          }],
          workExperiences: [{
            company: 'Empresa Test',
            position: 'Desarrollador',
            startDate: '2020-01-01',
            endDate: '2024-01-01'
          }],
          cv: {
            filePath: '/path/to/file.pdf',
            fileType: 'application/pdf'
          }
        };
        const mockResponse = {
          data: { id: 1, ...candidateData }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        const result = await sendCandidateData(candidateData);

        // Assert
        expect(result).toEqual(mockResponse.data); // 'El resultado debería contener todos los datos'
        expect(axios.post).toHaveBeenCalledWith( // 'Debería enviar todos los datos'
          'http://localhost:3010/candidates',
          candidateData
        );
      });

      test('debe_retornar_respuesta', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com'
        };
        const mockResponse = {
          data: { id: 1, ...candidateData }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        const result = await sendCandidateData(candidateData);

        // Assert
        expect(result).toEqual(mockResponse.data); // 'Debería retornar la respuesta del servidor'
        expect(result.id).toBe(1); // 'El ID debería estar presente'
      });
    });

    describe('Alternative Path', () => {
      test('debe_lanzar_error_si_envio_falla', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com'
        };
        const error = new Error('Network error');
        axios.post.mockRejectedValue(error);

        // Act & Assert
        await expect(
          sendCandidateData(candidateData)
          ).rejects.toThrow('Error al enviar datos del candidato:'); // 'Debería lanzar error si el envío falla'
      });

      test('debe_lanzar_error_con_mensaje_descriptivo', async () => {
        // Arrange
        const candidateData = {
          firstName: 'A', // Inválido
          lastName: 'Pérez',
          email: 'juan@example.com'
        };
        const axiosError = {
          response: {
            data: { message: 'Invalid name' }
          }
        };
        axios.post.mockRejectedValue(axiosError);

        // Act & Assert
        await expect(
          sendCandidateData(candidateData)
          ).rejects.toThrow('Error al enviar datos del candidato:'); // 'Debería lanzar error con mensaje descriptivo'
      });
    });

    describe('Casos Límite', () => {
      test('debe_manejar_datos_vacios', async () => {
        // Arrange
        const candidateData = {};
        const mockResponse = {
          data: { id: 1 }
        };

        axios.post.mockResolvedValue(mockResponse);

        // Act
        const result = await sendCandidateData(candidateData);

        // Assert
        expect(result).toBeDefined(); // 'Debería manejar datos vacíos correctamente'
        expect(axios.post).toHaveBeenCalledWith( // 'Debería enviar datos vacíos'
          'http://localhost:3010/candidates',
          {}
        );
      });

      test('debe_manejar_error_sin_response', async () => {
        // Arrange
        const candidateData = {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com'
        };
        const error = new Error('Network error');
        error.response = undefined;
        axios.post.mockRejectedValue(error);

        // Act & Assert
        await expect(
          sendCandidateData(candidateData)
          ).rejects.toThrow('Error al enviar datos del candidato:'); // 'Debería manejar error sin response'
      });
    });
  });
});

