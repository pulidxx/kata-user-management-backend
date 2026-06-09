import { Parser } from 'json2csv';
import { ClientService } from '../../../../src/modules/clients/services/client.service';
import { errors } from '../../../../src/utils';
import { sampleClient, sampleUser } from '../../../test-helpers';

const clientRepositoryMock = {
  findAll: jest.fn(),
  findById: jest.fn(),
  existsByDocument: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findAllForExport: jest.fn(),
};

const emailServiceMock = {
  sendClientCreated: jest.fn(),
  sendClientDeleted: jest.fn(),
  sendClientStatusChanged: jest.fn(),
};

jest.mock('../../../../src/modules/clients/repositories/client.repository', () => ({
  ClientRepository: jest.fn(() => clientRepositoryMock),
}));

jest.mock('../../../../src/utils/email.utils', () => ({
  EmailService: jest.fn(() => emailServiceMock),
}));

jest.mock('json2csv', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn(() => 'csv-output'),
  })),
}));

describe('ClientService', () => {
  const service = new ClientService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllClients filtra por owner cuando el usuario es asesor', async () => {
    clientRepositoryMock.findAll.mockResolvedValue({
      clients: [sampleClient()],
      total: 1,
    });

    const result = await service.getAllClients(sampleUser(), {
      page: 1,
      limit: 10,
      status: undefined,
      search: undefined,
    });

    expect(clientRepositoryMock.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      search: undefined,
      ownerId: 'user-1',
    });
    expect(result.clients[0].createdAt).toBe(sampleClient().createdAt.toISOString());
  });

  it('createClient rechaza el rol consulta', async () => {
    await expect(
      service.createClient(sampleUser({ role: 'consulta' }), {
        fullName: 'Cliente',
        documentType: 'CC',
        documentNumber: '123',
        email: 'client@test.com',
        phone: '3000000000',
        city: 'Bogotá',
        address: 'Calle 1',
        birthDate: '1990-01-01',
        status: 'Contactado',
      }),
    ).rejects.toEqual(errors.forbidden());
  });

  it('createClient guarda el owner y dispara el email', async () => {
    const client = sampleClient();

    clientRepositoryMock.existsByDocument.mockResolvedValue(false);
    clientRepositoryMock.create.mockResolvedValue(client);
    emailServiceMock.sendClientCreated.mockResolvedValue(undefined);

    const result = await service.createClient(sampleUser(), {
      fullName: 'Cliente Prueba',
      documentType: 'CC',
      documentNumber: '100200300',
      email: 'client@test.com',
      phone: '3001234567',
      city: 'Bogotá',
      address: 'Calle 123 #45-67',
      birthDate: '1990-01-01',
      status: 'Contactado',
    });

    expect(clientRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 'user-1' }));
    expect(emailServiceMock.sendClientCreated).toHaveBeenCalledWith(client);
    expect(result.id).toBe('client-1');
  });

  it('updateClient cambia estado y notifica el cambio', async () => {
    const current = sampleClient({ status: 'Contactado' });
    const updated = sampleClient({ status: 'Activo' });

    clientRepositoryMock.findById.mockResolvedValue(current);
    clientRepositoryMock.existsByDocument.mockResolvedValue(false);
    clientRepositoryMock.update.mockResolvedValue(updated);
    emailServiceMock.sendClientStatusChanged.mockResolvedValue(undefined);

    const result = await service.updateClient(sampleUser(), 'client-1', {
      status: 'Activo',
    });

    expect(clientRepositoryMock.update).toHaveBeenCalledWith('client-1', { status: 'Activo' });
    expect(emailServiceMock.sendClientStatusChanged).toHaveBeenCalledWith(updated, 'Contactado');
    expect(result.status).toBe('Activo');
  });

  it('exportClients devuelve el CSV generado', async () => {
    clientRepositoryMock.findAllForExport.mockResolvedValue([sampleClient()]);

    const csv = await service.exportClients(sampleUser(), {
      status: undefined,
      search: undefined,
    });

    expect(clientRepositoryMock.findAllForExport).toHaveBeenCalledWith({
      status: undefined,
      search: undefined,
      ownerId: 'user-1',
    });
    expect(csv).toBe('csv-output');
    expect(Parser).toHaveBeenCalled();
  });
});