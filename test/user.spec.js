describe('Unit tests user', () => {
    const user = {
        id: 1,
        first_name: 'test',
        last_name: 'toto',
        email: 'test@test.fr',
        password: 'test',
        created_at: new Date(),
        updated_at: new Date(),
        role: 'admin'
    };
    let users = [user];

    let req = {
        user: user,
        body: user,
        params: {
            id: 1
        }
    };

    let res = {
        json: jest.fn(),
        status: jest.fn().mockImplementation(() => {
            return res;
        }),
        sendStatus: jest.fn()
    };
    let userMockFunction = {
        findAll: jest.fn().mockResolvedValue(users),
        findOne: jest.fn().mockImplementation((options) => {
            let data;
            if(options.where.id === 1 || options.where.email === 'test@test.fr') {
                data = user;
            }else{
                data = null;
            }
            return Promise.resolve(data);
        }),
        update: jest.fn().mockResolvedValue(user),
        create: jest.fn().mockResolvedValue(user),
        destroy: jest.fn().mockResolvedValue([]),
    };
    beforeAll(() => {
        userController = require('../controllers/UserController')(userMockFunction);
    });
    describe('get all users', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return all users',async() => {
            await userController.getUsers(req, res);
            expect(userMockFunction.findAll).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(users);
        });

        it('should user are not authorize',async() => {
            req.user.role = 'user';
            await userController.getUsers(req, res);
            expect(userMockFunction.findAll).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(403);
            req.user.role = 'admin';
        });
    });
    describe('create user', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should not have all attribute',async() => {
            delete req.body.last_name;
            await userController.createUser(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(422);
            req.body.last_name = 'toto';
        });

        it('should email already exist',async() => {
            req.body.confirmPassword = 'test';
            await userController.createUser(req, res);
            expect(userMockFunction.findOne).toHaveBeenCalledWith({where: {email: req.body.email}});
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({message: "L'email existe déjà"});
        });

        it('should password not same',async() => {
            req.body.confirmPassword = 'caca';
            req.body.email = "youcef.jallali@gmail.com";
            await userController.createUser(req, res);
            expect(userMockFunction.findOne).toHaveBeenCalledWith({where: {email: req.body.email}});
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({message: "Les mots de passe ne correspondent pas"});
        });

        it('should create user',async() => {
            req.body.confirmPassword = 'test';
            req.body.role = 'user';
            await userController.createUser(req, res);
            expect(userMockFunction.findOne).toHaveBeenCalledWith({where: {email: req.body.email}});
            expect(userMockFunction.create).toHaveBeenCalledWith({...req.body});
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(req.body);
        });
    });
});