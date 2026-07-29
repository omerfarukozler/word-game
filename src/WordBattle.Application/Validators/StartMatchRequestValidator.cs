using FluentValidation;
using WordBattle.Application.Dtos.Requests;

namespace WordBattle.Application.Validators;

public sealed class StartMatchRequestValidator : AbstractValidator<StartMatchRequest>
{
    public StartMatchRequestValidator()
    {
        RuleFor(request => request.PlayerToken)
            .NotEmpty()
            .Must(token => !string.IsNullOrWhiteSpace(token))
            .WithMessage("Player token is required.");
    }
}
