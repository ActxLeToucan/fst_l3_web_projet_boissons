<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class Ingredients extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change()
    {
        $recipes = $this->table('recipe');
        $recipes->addColumn('descrIngredients', 'text', ['null' => true])
                ->update();
        $recipes->changeColumn('title', 'text', ['null' => false])
                ->update();

        $ingredients = $this->table('ingredient');
        $ingredients->changePrimaryKey(['recipe_id', 'aliment_id'])
                    ->update();
        $ingredients->removeColumn('quantity')
                    ->removeColumn('unit')
                    ->update();

        $aliments = $this->table('aliment');
        $aliments->changeColumn('name', 'text', ['null' => false])
                 ->update();
    }
}
