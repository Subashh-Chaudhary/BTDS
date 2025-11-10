import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Experts } from '../expert/entities/expert.entity';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Scan)
    private readonly scansRepo: Repository<Scan>,
    @InjectRepository(Experts)
    private readonly expertsRepo: Repository<Experts>,
  ) {}

  async createFeedback(expertId: string, scanId: string, data: { feedback_text: string }) {
    const scan = await this.scansRepo.findOne({ where: { id: scanId } });
    if (!scan) throw new NotFoundException('Scan not found');

    const expert = await this.expertsRepo.findOne({ where: { id: expertId } });
    if (!expert) throw new NotFoundException('Expert not found');

    const entity = this.feedbackRepo.create({
      scan,
      scan_id: scan.id,
      expert,
      expert_id: expert.id,
      feedback_text: data.feedback_text,
      verified_at: new Date(),
    });

    return this.feedbackRepo.save(entity);
  }

  async findByScan(scanId: string) {
    return this.feedbackRepo.find({ where: { scan: { id: scanId } }, relations: ['expert', 'scan'] });
  }

  async findOne(id: string) {
    const fb = await this.feedbackRepo.findOne({ where: { id }, relations: ['expert', 'scan'] });
    if (!fb) throw new NotFoundException('Feedback not found');
    return fb;
  }

  async updateFeedback(id: string, expertId: string, data: Partial<Feedback>) {
    const fb = await this.findOne(id);
    if (fb.expert_id !== expertId) throw new ForbiddenException('Not allowed to modify this feedback');
    await this.feedbackRepo.update(id, { feedback_text: data.feedback_text ?? fb.feedback_text, verified_at: new Date() } as any);
    return this.findOne(id);
  }

  async removeFeedback(id: string, expertId: string) {
    const fb = await this.findOne(id);
    if (fb.expert_id !== expertId) throw new ForbiddenException('Not allowed to remove this feedback');
    await this.feedbackRepo.remove(fb);
    return { id };
  }
}
