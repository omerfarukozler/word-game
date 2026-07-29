using FluentValidation;
using WordBattle.Application.Dtos.Requests;

namespace WordBattle.Application.Validators;

public sealed class RematchRequestValidator : AbstractValidator<RematchRequest>
{
    public RematchRequestValidator()
    {
        RuleFor(request => request.PlayerToken)
            .NotEmpty()
            .Must(token => !string.IsNullOrWhiteSpace(token))
            .WithMessage("Player token is required.");
    }
}
