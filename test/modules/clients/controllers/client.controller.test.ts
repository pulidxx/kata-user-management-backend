import { ClientController } from '../../../../src/modules/clients/controllers/client.controller';
import { buildMockResponse, sampleClient, sampleUser } from '../../../test-helpers';

const clientServiceMock = {
  getAllClients: jest.fn(),
  getClientById: jest.fn(),
  createClient: jest.fn(),
  updateClient: jest.fn(),
  updateClientStatus: jest.fn(),
  deleteClient: jest.fn(),
  exportClients: jest.fn(),
};

jest.mock('../../../../src/modules/clients/services/client.service', () => ({
  ClientService: jest.fn(() => clientServiceMock),
}));

describe('ClientController', () => {
  const controller = new ClientController();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getClientById responde 200 con el cliente', async () => {
    const res = buildMockResponse();
    clientServiceMock.getClientById.mockResolvedValue(sampleClient());

    await controller.getClientById({ params: { id: 'client-1' }, user: sampleUser() } as never, res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(sampleClient());
  });

  it('exportClients establece headers de descarga', async () => {
    const res = buildMockResponse();
    clientServiceMock.exportClients.mockResolvedValue('csv-output');

    await controller.exportClients({ query: {}, user: sampleUser() } as never, res as never);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=clientes.csv');
    expect(res.send).toHaveBeenCalledWith('csv-output');
  });
});