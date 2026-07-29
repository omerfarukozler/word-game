using FluentValidation;
using WordBattle.Application.Dtos.Requests;

namespace WordBattle.Application.Validators;

public sealed class SubmitGuessRequestValidator : AbstractValidator<SubmitGuessRequest>
{
    public SubmitGuessRequestValidator()
    {
        RuleFor(request => request.PlayerToken)
            .NotEmpty()
            .Must(token => !string.IsNullOrWhiteSpace(token))
            .WithMessage("Player token is required.");

        RuleFor(request => request.Word)
            .NotEmpty()
            .Must(word => !string.IsNullOrWhiteSpace(word))
            .WithMessage("Guess word is required.");
    }
}
