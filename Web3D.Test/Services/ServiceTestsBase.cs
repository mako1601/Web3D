using Moq;

namespace Web3D.Test.Services;

public class ServiceTestsBase
{
    protected readonly MockRepository mockRepository;

    public ServiceTestsBase()
    {
        mockRepository = new MockRepository(MockBehavior.Strict);
    }
}
