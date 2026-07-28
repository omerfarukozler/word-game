using FluentValidation;
using WordBattle.Application.Dtos.Requests;

namespace WordBattle.Application.Validators;

public sealed class JoinRoomRequestValidator : AbstractValidator<JoinRoomRequest>
{
    public JoinRoomRequestValidator()
    {
        RuleFor(request => request.Nickname)
            .NotEmpty()
            .Must(nickname => !string.IsNullOrWhiteSpace(nickname))
            .MinimumLength(2)
            .MaximumLength(32);
    }
}
