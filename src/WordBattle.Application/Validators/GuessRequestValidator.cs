using FluentValidation;
using WordBattle.Application.Dtos.Requests;

namespace WordBattle.Application.Validators;

public sealed class GuessRequestValidator : AbstractValidator<GuessRequest>
{
    public GuessRequestValidator()
    {
        RuleFor(request => request.PlayerToken)
            .NotEmpty()
            .MaximumLength(128);

        RuleFor(request => request.Word)
            .NotEmpty()
            .Must(word => !string.IsNullOrWhiteSpace(word))
            .MinimumLength(1)
            .MaximumLength(16);
    }
}
