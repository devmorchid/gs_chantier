<?php

namespace App\Notifications;

use App\Models\Charge;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ChargeDecisionNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Charge $charge,
        public string $adminName,
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
        $isAccepted = $this->charge->status === 'accepted';

        return [
            'category' => 'charge_decision',
            'charge_id' => $this->charge->id,
            'charge_reference' => $chargeRef,
            'status' => $this->charge->status,
            'rejection_reason' => $this->charge->rejection_reason,
            'admin_name' => $this->adminName,
            'title' => $isAccepted ? 'Charge acceptee' : 'Charge refusee',
            'message' => $isAccepted
                ? 'La charge ' . $chargeRef . ' a ete acceptee par ' . $this->adminName . '.'
                : 'La charge ' . $chargeRef . ' a ete refusee par ' . $this->adminName . '.',
            'url' => '/charges/' . $this->charge->id,
        ];
    }
}
