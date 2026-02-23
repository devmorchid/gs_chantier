<?php

namespace App\Notifications;

use App\Models\Charge;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ChargeSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Charge $charge,
        public string $chefName,
        public bool $isResubmission = false,
    ) {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $chargeRef = $this->charge->reference ?: ('#' . $this->charge->id);

        return [
            'category' => 'charge_submission',
            'charge_id' => $this->charge->id,
            'charge_reference' => $chargeRef,
            'status' => $this->charge->status,
            'chef_name' => $this->chefName,
            'is_resubmission' => $this->isResubmission,
            'title' => $this->isResubmission
                ? 'Charge refusee modifiee'
                : 'Nouvelle charge en attente',
            'message' => $this->isResubmission
                ? 'Le chef de projet ' . $this->chefName . ' a modifie la charge refusee ' . $chargeRef . '.'
                : 'Le chef de projet ' . $this->chefName . ' a cree la charge ' . $chargeRef . ' en attente de validation.',
            'url' => '/charges/' . $this->charge->id,
        ];
    }
}
